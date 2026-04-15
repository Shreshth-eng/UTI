const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Shipment = require("../models/Shipment");
const Truck = require("../models/Truck");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/trips
// @desc    Get trips based on role
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let trips;

    if (req.user.role === "driver") {
      trips = await Trip.find({ driver: req.user.id })
        .populate("shipment", "origin destination cargo status")
        .populate("truck", "plateNumber model")
        .sort({ createdAt: -1 });

    } else if (req.user.role === "truck_owner") {
      trips = await Trip.find({ owner: req.user.id })
        .populate("shipment", "origin destination cargo status")
        .populate("truck", "plateNumber model")
        .populate("driver", "name phone")
        .sort({ createdAt: -1 });

    } else {
      trips = await Trip.find()
        .populate("shipment", "origin destination status")
        .populate("driver", "name")
        .sort({ createdAt: -1 });
    }

    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   POST /api/trips
// @desc    Create a trip (assign shipment to truck+driver) - Truck Owner
// @access  Private - Truck Owner
router.post("/", protect, authorize("truck_owner"), async (req, res) => {
  try {
    const { shipmentId, truckId, driverId, revenue } = req.body;

    if (!shipmentId || !truckId || !driverId) {
      return res.status(400).json({ message: "shipmentId, truckId and driverId are required" });
    }

    // Update shipment with driver and truck
    await Shipment.findByIdAndUpdate(shipmentId, {
      assignedDriver: driverId,
      assignedTruck: truckId,
      status: "in_transit",
    });

    // Update truck status
    await Truck.findByIdAndUpdate(truckId, {
      status: "active",
      assignedDriver: driverId,
    });

    const trip = await Trip.create({
      shipment: shipmentId,
      truck: truckId,
      driver: driverId,
      owner: req.user.id,
      revenue: revenue || 0,
      status: "in_progress",
      startedAt: new Date(),
    });

    res.status(201).json({ message: "Trip started successfully", trip });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   PATCH /api/trips/:id/complete
// @desc    Mark trip as completed (Driver)
// @access  Private - Driver
router.patch("/:id/complete", protect, authorize("driver"), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your trip" });
    }

    trip.status = "completed";
    trip.completedAt = new Date();
    await trip.save();

    // Update shipment and truck
    await Shipment.findByIdAndUpdate(trip.shipment, { status: "delivered" });
    await Truck.findByIdAndUpdate(trip.truck, { 
      status: "available",
      $inc: { totalEarnings: trip.revenue }
    });

    res.json({ message: "Trip completed successfully", trip });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
