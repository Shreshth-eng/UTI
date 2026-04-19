import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import {
  getMyProfile,
  getShipments,
  updateShipmentStatus,
  getUser,
  getMyRequests,
  respondToRequest,
} from "../utils/api";

const ORS_KEY = import.meta.env.VITE_ORS_API_KEY;
const WEATHER_KEY = import.meta.env.VITE_WEATHER_API_KEY;

const navItems = [
  { label: "Overview", icon: "⊞" },
  { label: "Requests", icon: "📋" },
  { label: "Current Trip", icon: "🗺️" },
  { label: "Past Trips", icon: "📜" },
  { label: "Earnings", icon: "💰" },
];

const glassCard = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  borderRadius: "1.25rem",
  padding: "1.5rem",
};

const buildTimelineSteps = (shipment) => {
  if (!shipment) return [];
  const steps = [
    {
      label: "Trip Started",
      time: shipment.createdAt
        ? new Date(shipment.createdAt).toLocaleString()
        : "—",
      done: true,
    },
  ];
  if (shipment.checkpoints?.length > 0) {
    shipment.checkpoints.forEach((e) =>
      steps.push({
        label: e.message || "Update",
        time: e.timestamp ? new Date(e.timestamp).toLocaleString() : "—",
        done: true,
      }),
    );
  }
  if (shipment.status !== "delivered" && shipment.status !== "cancelled") {
    steps.push({
      label: "Delivery Pending",
      time: shipment.estimatedDelivery
        ? new Date(shipment.estimatedDelivery).toLocaleDateString()
        : "ETA TBD",
      done: false,
    });
  }
  return steps;
};

// ── Route Optimization Panel ──────────────────────────────────────
function RoutePanel({ shipment }) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchRoute = useCallback(async () => {
    if (!shipment?.origin || !shipment?.destination) return;
    setLoading(true);
    setError("");
    try {
      const [geoOrigin, geoDest] = await Promise.all([
        fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(shipment.origin)}&size=1`,
        ).then((r) => r.json()),
        fetch(
          `https://api.openrouteservice.org/geocode/search?api_key=${ORS_KEY}&text=${encodeURIComponent(shipment.destination)}&size=1`,
        ).then((r) => r.json()),
      ]);

      const originCoords = geoOrigin.features?.[0]?.geometry?.coordinates;
      const destCoords = geoDest.features?.[0]?.geometry?.coordinates;

      if (!originCoords || !destCoords) {
        setError("Could not find coordinates. Check city names.");
        return;
      }

      const orsRes = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-hgv",
        {
          method: "POST",
          headers: {
            Authorization: ORS_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [originCoords, destCoords],
            instructions: true,
            language: "en",
            units: "km",
            options: {
              vehicle_type: "hgv",
              weight: 10,
              height: 4.0,
              width: 2.5,
            },
          }),
        },
      ).then((r) => r.json());

      const route = orsRes.routes?.[0];
      if (!route) {
        setError("No route found.");
        return;
      }

      const summary = route.summary;
      const steps = route.segments?.[0]?.steps?.slice(0, 6) || [];

      let weather = null;
      let warnings = [];
      try {
        const wRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${originCoords[1]}&lon=${originCoords[0]}&appid=${WEATHER_KEY}&units=metric`,
        ).then((r) => r.json());
        weather = {
          condition: wRes.weather?.[0]?.main || "Clear",
          description: wRes.weather?.[0]?.description || "",
          temp: Math.round(wRes.main?.temp),
          windSpeed: wRes.wind?.speed,
          visibility: wRes.visibility,
        };
        const bad = [
          "Rain",
          "Snow",
          "Thunderstorm",
          "Fog",
          "Mist",
          "Haze",
          "Drizzle",
        ];
        if (bad.includes(weather.condition))
          warnings.push(`⚠️ ${weather.condition} on route — drive carefully`);
        if (weather.windSpeed > 15)
          warnings.push(`💨 High winds: ${weather.windSpeed} m/s`);
        if (weather.visibility < 1000)
          warnings.push(
            `🌫️ Low visibility: ${(weather.visibility / 1000).toFixed(1)} km`,
          );
      } catch {}

      setRouteData({
        distanceKm: parseFloat(summary.distance.toFixed(1)),
        durationHours: parseFloat((summary.duration / 3600).toFixed(1)),
        directions: steps.map((s) => ({
          instruction: s.instruction,
          distanceKm: parseFloat((s.distance / 1000).toFixed(1)),
        })),
        weather,
        warnings,
      });
      setLastUpdated(new Date().toLocaleTimeString());
    } catch {
      setError("Route optimization failed. Check API keys.");
    } finally {
      setLoading(false);
    }
  }, [shipment]);

  useEffect(() => {
    fetchRoute();
    const interval = setInterval(fetchRoute, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRoute]);

  return (
    <div style={glassCard}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black text-white uppercase tracking-widest">
          Live Route Optimization
        </h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-white/25">Updated {lastUpdated}</span>
          )}
          <button
            onClick={fetchRoute}
            disabled={loading}
            className="text-xs font-black text-white px-3 py-1.5 rounded-xl transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #a855f7, #7c3aed)" }}
          >
            {loading ? "Calculating..." : "Recalculate"}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold text-white/70">
          {shipment.origin}
        </span>
        <span className="text-white/30 text-xs">→</span>
        <span className="text-xs font-bold text-white/70">
          {shipment.destination}
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold"
          style={{
            background: "rgba(168,85,247,0.15)",
            border: "1px solid rgba(168,85,247,0.30)",
            color: "#d8b4fe",
          }}
        >
          HGV Route
        </span>
      </div>

      {loading && !routeData && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-xs animate-pulse">
            Optimizing — avoiding no-entry zones...
          </p>
        </div>
      )}

      {error && (
        <div
          className="px-4 py-3 rounded-xl text-xs font-semibold text-red-300 mb-4"
          style={{
            background: "rgba(239,68,68,0.10)",
            border: "1px solid rgba(239,68,68,0.25)",
          }}
        >
          {error}
        </div>
      )}

      {routeData && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.20)",
              }}
            >
              <p className="text-xs text-white/40 mb-1">Distance</p>
              <p className="text-sm font-black text-purple-300">
                {routeData.distanceKm} km
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(168,85,247,0.08)",
                border: "1px solid rgba(168,85,247,0.20)",
              }}
            >
              <p className="text-xs text-white/40 mb-1">ETA</p>
              <p className="text-sm font-black text-purple-300">
                {routeData.durationHours} hrs
              </p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.20)",
              }}
            >
              <p className="text-xs text-white/40 mb-1">Weather</p>
              <p className="text-sm font-black text-blue-300">
                {routeData.weather?.condition ?? "—"}{" "}
                {routeData.weather?.temp != null
                  ? `${routeData.weather.temp}°C`
                  : ""}
              </p>
            </div>
          </div>

          {routeData.warnings.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              {routeData.warnings.map((w, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-orange-300"
                  style={{
                    background: "rgba(249,115,22,0.10)",
                    border: "1px solid rgba(249,115,22,0.25)",
                  }}
                >
                  {w}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-2">
            Turn-by-turn
          </p>
          <div className="flex flex-col gap-1.5">
            {routeData.directions.map((d, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="text-xs text-purple-400 font-black shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-white/60 flex-1">{d.instruction}</p>
                <span className="text-xs text-white/25 shrink-0">
                  {d.distanceKm} km
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/20 mt-3 text-center">
            Auto-recalculates every 10 min · HGV no-entry zones avoided
          </p>
        </>
      )}
    </div>
  );
}

// ── Update Status Modal ───────────────────────────────────────────
function UpdateStatusModal({ shipmentId, onClose, onUpdated }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    {
      label: "Reached Checkpoint",
      value: "in_transit",
      message: "Reached Checkpoint",
    },
    {
      label: "Delayed — Traffic",
      value: "in_transit",
      message: "Delayed due to traffic",
    },
    {
      label: "Delivered Successfully",
      value: "delivered",
      message: "Delivered Successfully",
    },
    { label: "Issue Reported", value: "in_transit", message: "Issue Reported" },
  ];

  const handleUpdate = async () => {
    if (!selected) {
      alert("Please select a status");
      return;
    }
    const opt = statusOptions.find((o) => o.label === selected);
    setLoading(true);
    try {
      await updateShipmentStatus(shipmentId, opt.value, opt.message);
      onUpdated();
      onClose();
    } catch {
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "1.5rem",
          padding: "2rem",
          backdropFilter: "blur(30px)",
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Update Status</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition text-xl"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-6">
            {statusOptions.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelected(s.label)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background:
                    selected === s.label
                      ? "rgba(168,85,247,0.15)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    selected === s.label
                      ? "1px solid rgba(168,85,247,0.40)"
                      : "1px solid rgba(255,255,255,0.07)",
                  color:
                    selected === s.label ? "#d8b4fe" : "rgba(255,255,255,0.45)",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 text-white/50 text-sm font-semibold rounded-xl transition hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Driver Dashboard ─────────────────────────────────────────
export default function DriverDashboard() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [respondingId, setRespondingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, shipmentsRes, requestsRes] = await Promise.all([
        getMyProfile(),
        getShipments(), // ✅ trips ki jagah shipments
        getMyRequests(),
      ]);
      setProfile(profileRes);
      // Shipments — driver ko assigned wali
      const allShipments = Array.isArray(shipmentsRes) ? shipmentsRes : [];
      setShipments(allShipments);
      // Requests — sirf pending wali dikhao
      setRequests(
        Array.isArray(requestsRes)
          ? requestsRes.filter((r) => r.status === "pending")
          : [],
      );
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Poll every 30 sec
  useEffect(() => {
    fetchData();
    const interval = setInterval(async () => {
      try {
        const res = await getMyRequests();
        setRequests(
          Array.isArray(res) ? res.filter((r) => r.status === "pending") : [],
        );
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRespond = async (requestId, status) => {
    setRespondingId(requestId);
    try {
      await respondToRequest(requestId, status);
      setRequests((prev) => prev.filter((r) => r._id !== requestId));
      if (status === "accepted") fetchData();
    } catch {
      alert("Failed to respond. Try again.");
    } finally {
      setRespondingId(null);
    }
  };

  // ── Current trip = in_transit shipment assigned to driver ──
  const currentTrip = shipments.find(
    (s) => s.status === "in_transit" || s.status === "pending_pickup",
  );
  const pastTrips = shipments.filter(
    (s) => s.status === "delivered" || s.status === "cancelled",
  );

  // currentShipment = currentTrip itself (shipment IS the trip now)
  const currentShipment = currentTrip || null;
  const timelineSteps = buildTimelineSteps(currentShipment);

  const totalEarned = pastTrips.reduce((sum, s) => sum + (s.price ?? 0), 0);

  const localUser = getUser();
  const userName = profile?.name ?? localUser?.name ?? "Driver";
  const userPhone = profile?.phone ?? localUser?.phone ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const notifications = requests.map((r) => ({
    id: r._id,
    message: `New request: ${r.shipment?.origin ?? "—"} → ${r.shipment?.destination ?? "—"}`,
    time: new Date(r.createdAt).toLocaleString(),
  }));

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0a0f1e" }}
      >
        <p className="text-white/50 text-sm animate-pulse">
          Loading dashboard…
        </p>
      </div>
    );
  if (error)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0a0f1e" }}
      >
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="text-xs text-white/50 px-4 py-2 rounded-xl border border-white/10"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        role="Driver"
        navItems={navItems}
        active={activeNav}
        setActive={setActiveNav}
        user={{ name: userName, initials, phone: userPhone }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Driver Dashboard"
          subtitle="On The Road"
          notifications={notifications}
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Trips Completed"
            value={pastTrips.length}
            sub="All time"
            accent="white"
            icon="🏁"
          />
          <StatCard
            label="Pending Requests"
            value={requests.length}
            sub="Awaiting response"
            accent="orange"
            icon="📋"
          />
          <StatCard
            label="Current Trip"
            value={currentTrip ? "Active" : "None"}
            sub={currentTrip?._id?.slice(-6)?.toUpperCase() ?? "—"}
            accent="purple"
            icon="🗺️"
          />
          <StatCard
            label="Total Earned"
            value={`₹${totalEarned.toLocaleString()}`}
            sub="All time"
            accent="green"
            icon="💰"
          />
        </div>

        {/* ── Incoming Requests ── */}
        {requests.length > 0 && (
          <div style={glassCard} className="mb-5">
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">
              Incoming Requests
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-300 border border-orange-500/25">
                {requests.length}
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="p-4 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white">
                      #{req._id?.slice(-5)?.toUpperCase()}
                    </span>
                    <span className="text-xs text-orange-400 font-bold">
                      {req.shipment?.cargo?.weight
                        ? `${req.shipment.cargo.weight} kg`
                        : "—"}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white/70 mb-1">
                    {req.shipment?.origin ?? "—"} →{" "}
                    {req.shipment?.destination ?? "—"}
                  </p>
                  <p className="text-xs text-white/35 mb-1">
                    {req.shipment?.cargo?.description ?? "—"}
                  </p>
                  <p className="text-xs text-white/25 mb-3">
                    From: {req.sender?.name ?? "—"}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespond(req._id, "accepted")}
                      disabled={respondingId === req._id}
                      className="flex-1 py-1.5 text-xs font-black rounded-lg transition hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "rgba(34,197,94,0.15)",
                        border: "1px solid rgba(34,197,94,0.30)",
                        color: "#86efac",
                      }}
                    >
                      {respondingId === req._id ? "..." : "✓ Accept"}
                    </button>
                    <button
                      onClick={() => handleRespond(req._id, "rejected")}
                      disabled={respondingId === req._id}
                      className="flex-1 py-1.5 text-xs font-black rounded-lg transition hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "rgba(239,68,68,0.15)",
                        border: "1px solid rgba(239,68,68,0.30)",
                        color: "#fca5a5",
                      }}
                    >
                      {respondingId === req._id ? "..." : "✗ Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Current Trip + Timeline ── */}
        <div className="grid grid-cols-5 gap-5 mb-5">
          <div className="col-span-3" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Current Trip
              </h2>
              <div className="flex items-center gap-3">
                <Badge
                  status={
                    currentTrip
                      ? currentTrip.status === "in_transit"
                        ? "Active"
                        : "Pending"
                      : "None"
                  }
                />
                {currentTrip && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="text-xs font-black text-white px-4 py-2 rounded-xl transition hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                      boxShadow: "0 0 15px rgba(168,85,247,0.25)",
                    }}
                  >
                    Update Status
                  </button>
                )}
              </div>
            </div>

            {currentTrip ? (
              <div className="grid grid-cols-3 gap-3">
                {[
                  [
                    "Shipment ID",
                    currentTrip._id?.slice(-6)?.toUpperCase() ?? "—",
                  ],
                  [
                    "Route",
                    `${currentTrip.origin ?? "—"} → ${currentTrip.destination ?? "—"}`,
                  ],
                  [
                    "ETA",
                    currentTrip.estimatedDelivery
                      ? new Date(
                          currentTrip.estimatedDelivery,
                        ).toLocaleDateString()
                      : "—",
                  ],
                  ["Cargo", currentTrip.cargo?.description ?? "—"],
                  [
                    "Weight",
                    currentTrip.cargo?.weight
                      ? `${currentTrip.cargo.weight} kg`
                      : "—",
                  ],
                  ["Receiver", currentTrip.receiverName ?? "—"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p className="text-xs text-white/30 uppercase tracking-wider mb-1">
                      {k}
                    </p>
                    <p className="text-xs font-bold text-white">{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-white/30 text-sm">No active trip assigned</p>
              </div>
            )}
          </div>

          <div className="col-span-2" style={glassCard}>
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
              Trip Timeline
            </h2>
            {timelineSteps.length > 0 ? (
              <TrackingTimeline steps={timelineSteps} />
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-white/30 text-sm">No timeline events yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Route Optimization ── */}
        {currentTrip && (
          <div className="mb-5">
            <RoutePanel shipment={currentTrip} />
          </div>
        )}

        {/* ── Past Trips ── */}
        <div style={glassCard}>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
            Past Trips
          </h2>
          {pastTrips.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {pastTrips.map((s) => (
                <div
                  key={s._id}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-white">
                      #{s._id?.slice(-6)?.toUpperCase() ?? "—"}
                    </span>
                    <Badge
                      status={
                        s.status === "delivered" ? "Delivered" : "Cancelled"
                      }
                    />
                  </div>
                  <p className="text-xs text-white/50 mb-1">
                    {s.origin ?? "—"} → {s.destination ?? "—"}
                  </p>
                  <p className="text-xs text-white/25 mb-3">
                    {s.updatedAt
                      ? new Date(s.updatedAt).toLocaleDateString()
                      : "—"}
                  </p>
                  <span className="text-base font-black text-green-400">
                    ₹{(s.price ?? 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <p className="text-white/30 text-sm">No past trips yet</p>
            </div>
          )}
        </div>
      </main>

      {showModal && currentTrip && (
        <UpdateStatusModal
          shipmentId={currentTrip._id}
          onClose={() => setShowModal(false)}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
}
