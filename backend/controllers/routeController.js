const axios = require("axios");

const ORS_KEY = process.env.ORS_API_KEY;
const WEATHER_KEY = process.env.WEATHER_API_KEY;

// ── Geocode city name → [lng, lat] using ORS ─────────────────────
const geocodeCity = async (cityName) => {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(cityName)}&size=1`;
  const res = await axios.get(url);
  const features = res.data?.features;
  if (!features || features.length === 0) {
    throw new Error(`Could not geocode: ${cityName}`);
  }
  return features[0].geometry.coordinates; // [lng, lat]
};

// ── Get weather for a coordinate ─────────────────────────────────
const getWeather = async (lat, lng) => {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_KEY}&units=metric`;
    const res = await axios.get(url);
    const data = res.data;
    return {
      condition: data.weather[0]?.main || "Clear",
      description: data.weather[0]?.description || "",
      temp: data.main?.temp,
      windSpeed: data.wind?.speed,
      visibility: data.visibility, // metres
    };
  } catch {
    return null; // weather fail hone pe route block na ho
  }
};

// ── Build warnings from weather ───────────────────────────────────
const buildWeatherWarnings = (weather) => {
  if (!weather) return [];
  const warnings = [];
  const bad = [
    "Rain",
    "Snow",
    "Thunderstorm",
    "Fog",
    "Mist",
    "Haze",
    "Drizzle",
  ];
  if (bad.includes(weather.condition)) {
    warnings.push(`⚠️ ${weather.condition} on route — drive carefully`);
  }
  if (weather.windSpeed && weather.windSpeed > 15) {
    warnings.push(
      `💨 High winds: ${weather.windSpeed} m/s — heavy vehicle caution`,
    );
  }
  if (weather.visibility && weather.visibility < 1000) {
    warnings.push(
      `🌫️ Low visibility: ${Math.round((weather.visibility / 1000) * 10) / 10} km`,
    );
  }
  return warnings;
};

// ── Main: POST /api/routes/optimize ──────────────────────────────
const optimizeRoute = async (req, res) => {
  try {
    const { origin, destination, truckType, priority } = req.body;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ message: "origin and destination are required" });
    }

    // Step 1: Geocode both cities
    let originCoords, destCoords;
    try {
      [originCoords, destCoords] = await Promise.all([
        geocodeCity(origin),
        geocodeCity(destination),
      ]);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // Step 2: Determine ORS vehicle profile based on truck type
    // ORS profiles: driving-hgv (heavy goods vehicle), driving-car
    const profile =
      truckType === "Heavy" || truckType === "Medium"
        ? "driving-hgv"
        : "driving-car";

    // Step 3: Build ORS request
    // HGV options — restrict based on truck type
    const hgvOptions =
      profile === "driving-hgv"
        ? {
            vehicle_type: "hgv",
            // weight in tonnes — Heavy=20T, Medium=10T
            weight: truckType === "Heavy" ? 20 : 10,
            height: 4.0, // metres — standard truck height
            width: 2.5,
          }
        : {};

    const orsBody = {
      coordinates: [originCoords, destCoords],
      instructions: true,
      language: "en",
      units: "km",
      ...(profile === "driving-hgv" && { options: hgvOptions }),
    };

    const orsRes = await axios.post(
      `https://api.openrouteservice.org/v2/directions/${profile}`,
      orsBody,
      {
        headers: {
          Authorization: ORS_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    const route = orsRes.data.routes[0];
    const summary = route.summary;
    const steps = route.segments[0]?.steps || [];

    // Step 4: Get weather at origin
    const weather = await getWeather(originCoords[1], originCoords[0]);
    const weatherWarnings = buildWeatherWarnings(weather);

    // Step 5: Priority-based ETA adjustment
    // High priority → faster urgency label, no route change
    const priorityLabel =
      priority === "high"
        ? "🔴 High Priority — deliver ASAP"
        : priority === "medium"
          ? "🟡 Medium Priority"
          : "🟢 Standard Delivery";

    // Step 6: Build turn-by-turn directions (top 8 steps)
    const directions = steps.slice(0, 8).map((step) => ({
      instruction: step.instruction,
      distanceKm: parseFloat((step.distance / 1000).toFixed(1)),
      durationMin: Math.round(step.duration / 60),
    }));

    res.json({
      origin,
      destination,
      distanceKm: parseFloat(summary.distance.toFixed(1)),
      durationMin: Math.round(summary.duration / 60),
      durationHours: parseFloat((summary.duration / 3600).toFixed(1)),
      profile,
      priority: priorityLabel,
      weather: weather
        ? {
            condition: weather.condition,
            description: weather.description,
            temp: weather.temp,
            windSpeed: weather.windSpeed,
          }
        : null,
      warnings: weatherWarnings,
      directions,
      // Raw coordinates for map polyline (decode if needed)
      geometry: route.geometry,
      originCoords,
      destCoords,
      optimizedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("optimizeRoute error:", err?.response?.data || err.message);
    res.status(500).json({
      message: "Route optimization failed",
      error: err?.response?.data?.error?.message || err.message,
    });
  }
};

module.exports = { optimizeRoute };
