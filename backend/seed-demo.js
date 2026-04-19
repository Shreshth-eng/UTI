const mongoose = require("mongoose");
const Truck = require("./models/Truck");
const User = require("./models/User");
require("dotenv").config();

// ── Jaipur center coordinates ─────────────────────
const BASE_LAT = 26.9124;
const BASE_LNG = 75.7873;

// ── Random offset within radius ───────────────────
const randomNearby = (baseLat, baseLng, maxKm = 30) => {
  const offset = maxKm / 111; // ~111km per degree
  return {
    lat: baseLat + (Math.random() - 0.5) * offset * 2,
    lng: baseLng + (Math.random() - 0.5) * offset * 2,
  };
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected\n");

    // ── Find truck owner ──────────────────────────────
    const owner = await User.findOne({ role: "truck_owner" });
    if (!owner) {
      console.log("❌ No truck_owner found. Register a truck owner first.");
      process.exit(1);
    }
    console.log(`👤 Owner: ${owner.name} (${owner._id})`);

    // ── Find all drivers ──────────────────────────────
    const drivers = await User.find({ role: "driver" });
    console.log(`🚗 Drivers found: ${drivers.length}`);
    drivers.forEach((d) => console.log(`   - ${d.name} (${d._id})`));

    if (drivers.length === 0) {
      console.log(
        "\n⚠️  No drivers found. Register drivers first using browser console.",
      );
      console.log("Then run this script again.\n");
      process.exit(1);
    }

    // ── Demo truck data ───────────────────────────────
    const demoTrucks = [
      { plateNumber: "RJ14CD5678", model: "Tata 407", capacity: 5000 }, // 5 ton
      { plateNumber: "RJ14EF9012", model: "Ashok Leyland", capacity: 10000 }, // 10 ton
      { plateNumber: "RJ14GH3456", model: "Mahindra Blazo", capacity: 15000 }, // 15 ton
      { plateNumber: "DL01AB7890", model: "Eicher Pro", capacity: 8000 }, // 8 ton
    ];

    let created = 0;
    let updated = 0;

    for (let i = 0; i < demoTrucks.length; i++) {
      const t = demoTrucks[i];
      const loc = randomNearby(BASE_LAT, BASE_LNG, 25);

      // Assign driver if available (cycle through drivers)
      const driver = drivers[i % drivers.length];

      // Check if truck already exists
      const existing = await Truck.findOne({ plateNumber: t.plateNumber });

      if (existing) {
        // Update location + driver
        await Truck.findByIdAndUpdate(existing._id, {
          status: "available",
          assignedDriver: driver._id,
          currentLocation: {
            lat: loc.lat,
            lng: loc.lng,
            updatedAt: new Date(),
          },
        });
        console.log(`\n🔄 Updated: ${t.plateNumber}`);
        updated++;
      } else {
        // Create new truck
        await Truck.create({
          owner: owner._id,
          plateNumber: t.plateNumber,
          model: t.model,
          capacity: t.capacity,
          assignedDriver: driver._id,
          status: "available",
          currentLocation: {
            lat: loc.lat,
            lng: loc.lng,
            updatedAt: new Date(),
          },
        });
        console.log(`\n✅ Created: ${t.plateNumber}`);
        created++;
      }

      console.log(`   Model: ${t.model}`);
      console.log(`   Capacity: ${t.capacity / 1000} Ton`);
      console.log(`   Driver: ${driver.name}`);
      console.log(`   Location: ${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
    }

    // ── Also update existing truck (PB0123456) with location ─────
    const existingTruck = await Truck.findOne({ plateNumber: "PB0123456" });
    if (existingTruck) {
      const loc = randomNearby(BASE_LAT, BASE_LNG, 15);
      await Truck.findByIdAndUpdate(existingTruck._id, {
        status: "available",
        assignedDriver: drivers[0]._id,
        currentLocation: {
          lat: loc.lat,
          lng: loc.lng,
          updatedAt: new Date(),
        },
      });
      console.log(`\n🔄 Updated existing truck: PB0123456`);
      console.log(`   Driver: ${drivers[0].name}`);
    }

    console.log("\n─────────────────────────────────────");
    console.log(`✅ Created: ${created} trucks`);
    console.log(`🔄 Updated: ${updated + (existingTruck ? 1 : 0)} trucks`);
    console.log("\n🎯 Demo ready! All trucks are:");
    console.log("   → status: available");
    console.log("   → location: within 25km of Jaipur center");
    console.log("   → drivers: assigned");
    console.log("\n📱 Demo accounts:");
    console.log("   Sender:     sender@demo.com / demo1234");
    console.log("   Driver 1:   driver1@demo.com / demo1234");
    console.log("   Driver 2:   driver2@demo.com / demo1234");
    console.log("   Truck Owner: (your registered account)");
    console.log("   Receiver:   (your registered account)");
    console.log("\n🚀 Start demo flow now!\n");

    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
  });
