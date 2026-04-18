const BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── AUTH ──────────────────────────────────────────────────────────

export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const registerUser = async (data) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const getMyProfile = async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, { headers: headers() });
  return res.json();
};

// ── SHIPMENTS ─────────────────────────────────────────────────────

export const getShipments = async () => {
  const res = await fetch(`${BASE_URL}/shipments`, { headers: headers() });
  return res.json();
};

export const createShipment = async (data) => {
  const res = await fetch(`${BASE_URL}/shipments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const updateShipmentStatus = async (id, status, checkpointMessage) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/status`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ status, checkpointMessage }),
  });
  return res.json();
};

// ── TRUCKS ────────────────────────────────────────────────────────

export const getTrucks = async () => {
  const res = await fetch(`${BASE_URL}/trucks`, { headers: headers() });
  return res.json();
};

export const addTruck = async (data) => {
  const res = await fetch(`${BASE_URL}/trucks`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const assignDriver = async (truckId, driverId) => {
  const res = await fetch(`${BASE_URL}/trucks/${truckId}/assign-driver`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ driverId }),
  });
  return res.json();
};

// Sender ke paas nearby trucks dhundho — GPS location se
export const getNearbyTrucks = async (lat, lng, radius = 50) => {
  const res = await fetch(
    `${BASE_URL}/trucks/nearby?lat=${lat}&lng=${lng}&radius=${radius}`,
    { headers: headers() },
  );
  return res.json();
};

// Driver apni truck ki location update kare
export const updateMyLocation = async (truckId, lat, lng) => {
  const res = await fetch(`${BASE_URL}/trucks/${truckId}/location`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ lat, lng }),
  });
  return res.json();
};

// ── REQUESTS ──────────────────────────────────────────────────────

// Sender: driver ko request bhejo
export const sendTruckRequest = async (driverId, truckId, shipmentId) => {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ driverId, truckId, shipmentId }),
  });
  return res.json();
};

// Apni requests dekho (role based — driver/sender/owner sab use karein)
export const getMyRequests = async () => {
  const res = await fetch(`${BASE_URL}/requests`, { headers: headers() });
  return res.json();
};

// Driver: accept ya reject karo
export const respondToRequest = async (requestId, status) => {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/respond`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

// Truck Owner: final confirm karo
export const confirmRequest = async (requestId) => {
  const res = await fetch(`${BASE_URL}/requests/${requestId}/confirm`, {
    method: "PATCH",
    headers: headers(),
  });
  return res.json();
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────

export const getMyNotifications = async () => {
  const res = await fetch(`${BASE_URL}/notifications`, { headers: headers() });
  return res.json();
};

export const markNotificationRead = async (id) => {
  const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: headers(),
  });
  return res.json();
};

export const markAllNotificationsRead = async () => {
  const res = await fetch(`${BASE_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: headers(),
  });
  return res.json();
};

// ── TRIPS ─────────────────────────────────────────────────────────

export const getTrips = async () => {
  const res = await fetch(`${BASE_URL}/trips`, { headers: headers() });
  return res.json();
};

export const createTrip = async (data) => {
  const res = await fetch(`${BASE_URL}/trips`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return res.json();
};

export const completeTrip = async (tripId) => {
  const res = await fetch(`${BASE_URL}/trips/${tripId}/complete`, {
    method: "PATCH",
    headers: headers(),
  });
  return res.json();
};

// ── AUTH HELPERS ──────────────────────────────────────────────────

export const saveAuth = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const getDashboardRoute = (role) => {
  const routes = {
    receiver: "/dashboard/receiver",
    sender: "/dashboard/sender",
    truck_owner: "/dashboard/truck-owner",
    driver: "/dashboard/driver",
  };
  return routes[role] || "/login";
};
