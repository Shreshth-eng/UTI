const BASE_URL = "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => localStorage.getItem("token");

// Common headers
const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

// ── AUTH ──────────────────────────────────────

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

// ── SHIPMENTS ─────────────────────────────────

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

// ── TRUCKS ────────────────────────────────────

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

// ── TRIPS ─────────────────────────────────────

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

// ── AUTH HELPERS ──────────────────────────────

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

// Role → Dashboard route mapper
export const getDashboardRoute = (role) => {
  const routes = {
    receiver: "/dashboard/receiver",
    sender: "/dashboard/sender",
    truck_owner: "/dashboard/truck-owner",
    driver: "/dashboard/driver",
  };
  return routes[role] || "/login";
};
