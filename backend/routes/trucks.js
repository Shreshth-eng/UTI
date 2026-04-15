const express = require("express");
const router = express.Router();
const Truck = require("../models/Truck");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/trucks
// @desc    Get trucks (owner sees their own, driver sees available)
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let trucks;

    if (req.user.role === "truck_owner") {
      trucks = await Truck.find({ owner: req.user.id })
        .populate("assignedDriver", "name phone email");
    } else if (req.user.role === "driver") {
      trucks = await Truck.find({ status: "available" })
        .populate("owner", "name phone");
    } else {
      trucks = await Truck.find({ status: "active" })
        .populate("owner", "name")
        .populate("assignedDriver", "name");
    }

    res.json(trucks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   POST /api/trucks
// @desc    Add new truck (Truck Owner only)
// @access  Private - Truck Owner
router.post("/", protect, authorize("truck_owner"), async (req, res) => {
  try {
    const { plateNumber, model, capacity } = req.body;

    if (!plateNumber || !model || !capacity) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Check duplicate plate
    const existing = await Truck.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Truck with this plate already exists" });
    }

    const truck = await Truck.create({
      owner: req.user.id,
      plateNumber,
      model,
      capacity,
    });

    res.status(201).json({ message: "Truck added successfully", truck });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   PATCH /api/trucks/:id/assign-driver
// @desc    Assign driver to truck (Truck Owner only)
// @access  Private - Truck Owner
router.patch("/:id/assign-driver", protect, authorize("truck_owner"), async (req, res) => {
  try {
    const { driverId } = req.body;

    const truck = await Truck.findById(req.params.id);
    if (!truck) return res.status(404).json({ message: "Truck not found" });

    if (truck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your truck" });
    }

    truck.assignedDriver = driverId || null;
    truck.status = driverId ? "active" : "available";
    await truck.save();

    res.json({ message: "Driver assigned", truck });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   PATCH /api/trucks/:id/status
// @desc    Update truck status (Truck Owner only)
// @access  Private - Truck Owner
router.patch("/:id/status", protect, authorize("truck_owner"), async (req, res) => {
  try {
    const { status } = req.body;

    const truck = await Truck.findById(req.params.id);
    if (!truck) return res.status(404).json({ message: "Truck not found" });

    if (truck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your truck" });
    }

    truck.status = status;
    await truck.save();

    res.json({ message: "Truck status updated", truck });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   DELETE /api/trucks/:id
// @desc    Delete truck (Truck Owner only)
// @access  Private - Truck Owner
router.delete("/:id", protect, authorize("truck_owner"), async (req, res) => {
  try {
    const truck = await Truck.findById(req.params.id);
    if (!truck) return res.status(404).json({ message: "Truck not found" });

    if (truck.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your truck" });
    }

    await truck.deleteOne();
    res.json({ message: "Truck removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
