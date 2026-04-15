const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/shipments
// @desc    Get shipments based on role
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    let shipments;

    if (req.user.role === "sender") {
      // Sender sees their own shipments
      shipments = await Shipment.find({ sender: req.user.id })
        .populate("assignedDriver", "name phone")
        .populate("assignedTruck", "plateNumber model")
        .sort({ createdAt: -1 });

    } else if (req.user.role === "receiver") {
      // Receiver sees shipments sent to them
      shipments = await Shipment.find({ receiver: req.user.id })
        .populate("sender", "name phone")
        .populate("assignedDriver", "name phone")
        .sort({ createdAt: -1 });

    } else if (req.user.role === "driver") {
      // Driver sees trips assigned to them
      shipments = await Shipment.find({ assignedDriver: req.user.id })
        .populate("sender", "name phone")
        .sort({ createdAt: -1 });

    } else if (req.user.role === "truck_owner") {
      // Truck owner sees all shipments on their trucks
      shipments = await Shipment.find({ assignedDriver: { $ne: null } })
        .populate("assignedTruck", "plateNumber model owner")
        .populate("sender", "name")
        .sort({ createdAt: -1 });
    }

    res.json(shipments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   POST /api/shipments
// @desc    Create new shipment (Sender only)
// @access  Private - Sender
router.post("/", protect, authorize("sender"), async (req, res) => {
  try {
    const { receiverName, origin, destination, cargo, price, estimatedDelivery } = req.body;

    if (!receiverName || !origin || !destination || !cargo) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const shipment = await Shipment.create({
      sender: req.user.id,
      receiverName,
      origin,
      destination,
      cargo,
      price: price || 0,
      estimatedDelivery: estimatedDelivery || null,
    });

    res.status(201).json({ message: "Shipment created", shipment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   GET /api/shipments/:id
// @desc    Get single shipment
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("sender", "name email phone")
      .populate("assignedDriver", "name phone")
      .populate("assignedTruck", "plateNumber model");

    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    res.json(shipment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route   PATCH /api/shipments/:id/status
// @desc    Update shipment status (Driver only)
// @access  Private - Driver
router.patch("/:id/status", protect, authorize("driver"), async (req, res) => {
  try {
    const { status, checkpointMessage } = req.body;

    const validStatuses = ["pending_pickup", "in_transit", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) return res.status(404).json({ message: "Shipment not found" });

    // Only assigned driver can update
    if (shipment.assignedDriver.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your assigned shipment" });
    }

    shipment.status = status;
    if (checkpointMessage) {
      shipment.checkpoints.push({ message: checkpointMessage });
    }

    await shipment.save();

    res.json({ message: "Status updated", shipment });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
