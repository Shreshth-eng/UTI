const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    receiverName: {
      type: String,
      required: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    cargo: {
      description: { type: String, required: true },
      weight: { type: Number, required: true }, // in kg
    },
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending_pickup", "in_transit", "delivered", "cancelled"],
      default: "pending_pickup",
    },
    assignedTruck: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Truck",
      default: null,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    estimatedDelivery: {
      type: Date,
      default: null,
    },
    // Driver checkpoint updates
    checkpoints: [
      {
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", shipmentSchema);
