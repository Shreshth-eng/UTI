const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // Kisko notification jaegi
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "request_accepted",
        "new_request",
        "owner_confirm_needed",
        "trip_started",
        "trip_completed",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Related data ke references
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      default: null,
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
