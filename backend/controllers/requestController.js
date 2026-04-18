const Request = require("../models/Request");
const Truck = require("../models/Truck");
const Shipment = require("../models/Shipment");
const Notification = require("../models/Notification");

// ── 1. Nearby trucks dhundho (Sender use karta hai) ──────────────
const getNearbyTrucks = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = parseFloat(radius);

    const trucks = await Truck.find({
      status: "available",
      "currentLocation.lat": { $ne: null },
      "currentLocation.lng": { $ne: null },
    })
      .populate("assignedDriver", "name phone")
      .populate("owner", "name phone");

    const nearby = trucks
      .map((truck) => {
        const dist = getDistanceKm(
          userLat,
          userLng,
          truck.currentLocation.lat,
          truck.currentLocation.lng,
        );
        return { ...truck.toObject(), distanceKm: parseFloat(dist.toFixed(1)) };
      })
      .filter((t) => t.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    res.json(nearby);
  } catch (err) {
    console.error("getNearbyTrucks error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 2. Driver apni location update kare ──────────────────────────
const updateTruckLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const { truckId } = req.params;
    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng required" });
    }
    const truck = await Truck.findByIdAndUpdate(
      truckId,
      {
        currentLocation: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          updatedAt: new Date(),
        },
      },
      { new: true },
    );
    if (!truck) return res.status(404).json({ message: "Truck not found" });
    res.json({ message: "Location updated", truck });
  } catch (err) {
    console.error("updateTruckLocation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 3. Sender driver ko request bheje ────────────────────────────
const sendRequest = async (req, res) => {
  try {
    const { driverId, truckId, shipmentId } = req.body;
    const senderId = req.user.id;

    const shipment = await Shipment.findById(shipmentId);
    if (!shipment)
      return res.status(404).json({ message: "Shipment not found" });
    if (shipment.sender.toString() !== senderId.toString()) {
      return res.status(403).json({ message: "Not your shipment" });
    }

    const truck = await Truck.findById(truckId);
    if (!truck) return res.status(404).json({ message: "Truck not found" });
    if (truck.status !== "available") {
      return res.status(400).json({ message: "Truck is not available" });
    }

    const existing = await Request.findOne({
      shipment: shipmentId,
      driver: driverId,
      status: "pending",
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Request already sent to this driver" });
    }

    const request = await Request.create({
      sender: senderId,
      driver: driverId,
      truck: truckId,
      shipment: shipmentId,
    });

    await Notification.create({
      recipient: driverId,
      type: "new_request",
      message: `New shipment request: ${shipment.origin} to ${shipment.destination}`,
      request: request._id,
      shipment: shipmentId,
    });

    res.status(201).json({ message: "Request sent successfully", request });
  } catch (err) {
    console.error("sendRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 4. Apni requests dekho (role based) ──────────────────────────
const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    let requests;

    if (role === "driver") {
      requests = await Request.find({ driver: userId })
        .populate("sender", "name phone")
        .populate("shipment")
        .populate("truck", "plateNumber model capacity")
        .sort({ createdAt: -1 });
    } else if (role === "sender") {
      requests = await Request.find({ sender: userId })
        .populate("driver", "name phone licenseNumber")
        .populate("shipment")
        .populate("truck", "plateNumber model capacity")
        .sort({ createdAt: -1 });
    } else if (role === "truck_owner") {
      const ownerTrucks = await Truck.find({ owner: userId }).select("_id");
      const truckIds = ownerTrucks.map((t) => t._id);
      requests = await Request.find({ truck: { $in: truckIds } })
        .populate("sender", "name phone")
        .populate("driver", "name phone")
        .populate("shipment")
        .populate("truck", "plateNumber model capacity")
        .sort({ createdAt: -1 });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(requests);
  } catch (err) {
    console.error("getMyRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 5. Driver accept/reject kare ─────────────────────────────────
const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const driverId = req.user.id;

    if (!["accepted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be accepted or rejected" });
    }

    const request = await Request.findById(req.params.id)
      .populate("shipment")
      .populate("truck");

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.driver.toString() !== driverId.toString()) {
      return res.status(403).json({ message: "Not your request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already responded to" });
    }

    request.status = status;
    await request.save();

    if (status === "accepted") {
      await Truck.findByIdAndUpdate(request.truck._id, { status: "active" });

      const truck = await Truck.findById(request.truck._id);
      await Notification.create({
        recipient: truck.owner,
        type: "owner_confirm_needed",
        message: `Driver accepted a request for truck ${truck.plateNumber}. Please confirm the shipment.`,
        request: request._id,
        shipment: request.shipment._id,
      });

      await Notification.create({
        recipient: request.sender,
        type: "request_accepted",
        message: `Driver accepted your shipment request: ${request.shipment.origin} to ${request.shipment.destination}`,
        request: request._id,
        shipment: request.shipment._id,
      });
    }

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    console.error("respondToRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── 6. Truck owner final confirm kare ────────────────────────────
const ownerConfirmRequest = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const request = await Request.findById(req.params.id)
      .populate("truck")
      .populate("shipment");

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "accepted") {
      return res.status(400).json({ message: "Driver has not accepted yet" });
    }

    const truck = await Truck.findById(request.truck._id);
    if (truck.owner.toString() !== ownerId.toString()) {
      return res.status(403).json({ message: "Not your truck" });
    }

    request.ownerConfirmed = true;
    await request.save();

    await Shipment.findByIdAndUpdate(request.shipment._id, {
      assignedTruck: request.truck._id,
      assignedDriver: request.driver,
      status: "in_transit",
    });

    await Notification.create({
      recipient: request.driver,
      type: "trip_started",
      message: `Trip confirmed by owner. You can now start the shipment.`,
      request: request._id,
      shipment: request.shipment._id,
    });

    res.json({ message: "Shipment confirmed by owner", request });
  } catch (err) {
    console.error("ownerConfirmRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Haversine formula ─────────────────────────────────────────────
const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const toRad = (deg) => (deg * Math.PI) / 180;

module.exports = {
  getNearbyTrucks,
  updateTruckLocation,
  sendRequest,
  getMyRequests,
  respondToRequest,
  ownerConfirmRequest,
};
