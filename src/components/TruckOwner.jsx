import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import {
  getTrucks,
  addTruck,
  getMyRequests,
  confirmRequest,
  getMyNotifications,
  markAllNotificationsRead,
  getMyProfile,
} from "../utils/api";

const navItems = [
  { label: "Overview", icon: "⊞" },
  { label: "My Fleet", icon: "🚛" },
  { label: "Requests", icon: "📋" },
  { label: "Earnings", icon: "💰" },
  { label: "Notifications", icon: "🔔" },
];

const glassCard = {
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
  borderRadius: "1.25rem",
  padding: "1.5rem",
};

const inputStyle = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "0.75rem",
  color: "white",
  fontSize: "0.875rem",
  outline: "none",
};

const normalizeTruckStatus = (status) => {
  const map = {
    available: "Available",
    active: "On Trip",
    maintenance: "Maintenance",
  };
  return map[status] || status;
};

function LoadingRow() {
  return (
    <div
      className="p-4 rounded-xl animate-pulse"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="h-4 w-1/3 rounded bg-white/10 mb-2" />
      <div className="h-3 w-1/2 rounded bg-white/5" />
    </div>
  );
}

function AddTruckModal({ onClose, onTruckAdded }) {
  const [form, setForm] = useState({
    plateNumber: "",
    model: "",
    capacity: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.plateNumber || !form.model || !form.capacity) {
      setError("All fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await addTruck({
        plateNumber: form.plateNumber.toUpperCase(),
        model: form.model,
        capacity: parseFloat(form.capacity) * 1000,
      });
      if (res?.truck || res?._id) {
        onTruckAdded(res.truck || res);
        onClose();
      } else {
        setError(res?.message || "Failed to add truck.");
      }
    } catch {
      setError("Server error. Please try again.");
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
        className="w-full max-w-md relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "1.5rem",
          padding: "2rem",
          backdropFilter: "blur(30px)",
        }}
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-green-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Add New Truck</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition text-xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-xs font-semibold text-red-300"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.25)",
              }}
            >
              {error}
            </div>
          )}

          <div className="mb-3">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Plate Number *
            </label>
            <input
              name="plateNumber"
              value={form.plateNumber}
              onChange={handle}
              placeholder="e.g. PB10AB1234"
              style={inputStyle}
            />
          </div>
          <div className="mb-3">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Truck Model *
            </label>
            <input
              name="model"
              value={form.model}
              onChange={handle}
              placeholder="e.g. Tata 407"
              style={inputStyle}
            />
          </div>
          <div className="mb-6">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Capacity (Ton) *
            </label>
            <input
              name="capacity"
              type="number"
              value={form.capacity}
              onChange={handle}
              placeholder="e.g. 10"
              style={inputStyle}
            />
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
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Adding..." : "Add Truck"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TruckOwner() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const [trucks, setTrucks] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [trucksLoading, setTrucksLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [trucksError, setTrucksError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchTrucks = useCallback(async () => {
    setTrucksLoading(true);
    setTrucksError("");
    try {
      const res = await getTrucks();
      setTrucks(Array.isArray(res) ? res : res?.trucks || []);
    } catch {
      setTrucksError("Could not load trucks.");
    } finally {
      setTrucksLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    setRequestsLoading(true);
    setRequestsError("");
    try {
      const res = await getMyRequests();
      const list = Array.isArray(res) ? res : [];
      // Owner sees: driver accepted but not yet owner confirmed
      setPendingRequests(
        list.filter((r) => r.status === "accepted" && !r.ownerConfirmed),
      );
    } catch {
      setRequestsError("Could not load requests.");
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getMyNotifications();
      setNotifications(Array.isArray(res) ? res : []);
    } catch {}
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getMyProfile();
      setProfile(res?.user || res);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTrucks();
    fetchRequests();
    fetchNotifications();
    fetchProfile();
    // Poll every 30 sec for new confirmations + notifications
    const interval = setInterval(() => {
      fetchRequests();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTrucks, fetchRequests, fetchNotifications, fetchProfile]);

  // Stats auto-compute from real truck statuses
  const stats = {
    totalTrucks: trucks.length,
    onTrip: trucks.filter((t) => t.status === "active").length,
    available: trucks.filter((t) => t.status === "available").length,
    maintenance: trucks.filter((t) => t.status === "maintenance").length,
  };

  // Owner confirms → shipment assigned → truck status auto becomes "active"
  const handleConfirm = async (requestId) => {
    setConfirmingId(requestId);
    try {
      await confirmRequest(requestId);
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
      // Refresh trucks — "active" count will go up automatically
      fetchTrucks();
      fetchNotifications();
    } catch {
      alert("Failed to confirm. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };

  const handleTruckAdded = (newTruck) => {
    if (newTruck) setTrucks((prev) => [...prev, newTruck]);
    else fetchTrucks();
  };

  const unreadNotifs = notifications
    .filter((n) => !n.read)
    .slice(0, 5)
    .map((n) => ({
      id: n._id,
      message: n.message,
      time: new Date(n.createdAt).toLocaleString(),
    }));

  const sidebarUser = profile
    ? {
        name: profile.name || "Truck Owner",
        initials: (profile.name || "TO")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
        phone: profile.phone || "",
      }
    : { name: "Truck Owner", initials: "TO", phone: "" };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-green-500/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        role="Truck Owner"
        navItems={navItems}
        active={activeNav}
        setActive={setActiveNav}
        user={sidebarUser}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Fleet Dashboard"
          subtitle="Truck Owner Portal"
          notifications={unreadNotifs}
        />

        {/* ── Stat Cards — auto update ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Trucks"
            value={stats.totalTrucks}
            sub="In fleet"
            accent="white"
            icon="🚛"
          />
          <StatCard
            label="On Trip"
            value={stats.onTrip}
            sub="Currently active"
            accent="blue"
            icon="📍"
          />
          <StatCard
            label="Available"
            value={stats.available}
            sub="Ready to assign"
            accent="green"
            icon="✅"
          />
          <StatCard
            label="Maintenance"
            value={stats.maintenance}
            sub="Under repair"
            accent="red"
            icon="🔧"
          />
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">
          {/* ── My Fleet ── */}
          <div className="col-span-2" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                My Fleet
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-black text-white px-4 py-2 rounded-xl transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: "0 0 15px rgba(34,197,94,0.25)",
                }}
              >
                + Add Truck
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {trucksLoading ? (
                [1, 2, 3].map((i) => <LoadingRow key={i} />)
              ) : trucksError ? (
                <div className="text-center py-6">
                  <p className="text-sm text-red-400 mb-3">{trucksError}</p>
                  <button
                    onClick={fetchTrucks}
                    className="text-xs px-4 py-2 rounded-lg text-white/60 hover:text-white transition"
                    style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                  >
                    Retry
                  </button>
                </div>
              ) : trucks.length === 0 ? (
                <p className="text-sm text-white/25 text-center mt-8">
                  No trucks yet. Add your first truck!
                </p>
              ) : (
                trucks.map((truck) => (
                  <div
                    key={truck._id}
                    className="p-4 rounded-xl"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{
                          background: "rgba(34,197,94,0.10)",
                          border: "1px solid rgba(34,197,94,0.20)",
                        }}
                      >
                        🚛
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black text-white">
                            {truck.plateNumber}
                          </span>
                          <span className="text-xs text-white/25">
                            · {truck.model} ·{" "}
                            {truck.capacity
                              ? `${(truck.capacity / 1000).toFixed(0)} Ton`
                              : "—"}
                          </span>
                        </div>
                        <p className="text-xs text-white/40">
                          {truck.assignedDriver?.name || "No driver assigned"}
                        </p>
                        {truck.currentLocation?.lat && (
                          <p className="text-xs text-blue-400 mt-1">
                            📍 Live location available
                          </p>
                        )}
                        {truck.totalEarnings > 0 && (
                          <p className="text-xs text-orange-400 mt-1">
                            ₹{truck.totalEarnings.toLocaleString()} earned
                          </p>
                        )}
                      </div>
                      {/* Status auto-updates: available → active (on trip) → available (delivered) */}
                      <Badge status={normalizeTruckStatus(truck.status)} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Confirm Requests + Notifications ── */}
          <div style={glassCard}>
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
              Confirm Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-300 border border-orange-500/25">
                  {pendingRequests.length}
                </span>
              )}
            </h2>

            {requestsLoading ? (
              [1, 2].map((i) => <LoadingRow key={i} />)
            ) : requestsError ? (
              <div className="text-center py-6">
                <p className="text-sm text-red-400 mb-3">{requestsError}</p>
                <button
                  onClick={fetchRequests}
                  className="text-xs px-4 py-2 rounded-lg text-white/60 hover:text-white transition"
                  style={{ border: "1px solid rgba(255,255,255,0.10)" }}
                >
                  Retry
                </button>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center mt-4 mb-4">
                <p className="text-sm text-white/25">
                  No pending confirmations
                </p>
                <p className="text-xs text-white/15 mt-1">
                  Driver accepted requests appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-5">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(34,197,94,0.15)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white">
                        #{req._id?.slice(-5)?.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-green-400">
                        Driver Accepted ✓
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white/70 mb-1">
                      {req.shipment?.origin ?? "—"} →{" "}
                      {req.shipment?.destination ?? "—"}
                    </p>
                    <p className="text-xs text-white/35 mb-1">
                      {req.shipment?.cargo?.description ?? "—"} ·{" "}
                      {req.shipment?.cargo?.weight
                        ? `${req.shipment.cargo.weight} kg`
                        : "—"}
                    </p>
                    <p className="text-xs text-white/25 mb-1">
                      Driver: {req.driver?.name ?? "—"}
                    </p>
                    <p className="text-xs text-white/25 mb-1">
                      Truck: {req.truck?.plateNumber ?? "—"}
                    </p>
                    <p className="text-xs text-white/20 mb-3">
                      Sender: {req.sender?.name ?? "—"}
                    </p>
                    <button
                      onClick={() => handleConfirm(req._id)}
                      disabled={confirmingId === req._id}
                      className="w-full py-2 text-xs font-black rounded-lg transition hover:opacity-90 disabled:opacity-50 text-white"
                      style={{
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        boxShadow: "0 0 12px rgba(34,197,94,0.25)",
                      }}
                    >
                      {confirmingId === req._id
                        ? "Confirming..."
                        : "✓ Confirm Trip"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Recent Notifications ── */}
            {notifications.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-white/50 uppercase tracking-widest">
                    Alerts
                  </h3>
                  <button
                    onClick={async () => {
                      await markAllNotificationsRead();
                      fetchNotifications();
                    }}
                    className="text-xs text-white/30 hover:text-white/60 transition"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n._id}
                      className="px-3 py-2 rounded-lg"
                      style={{
                        background: n.read
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(34,197,94,0.06)",
                        border: n.read
                          ? "1px solid rgba(255,255,255,0.05)"
                          : "1px solid rgba(34,197,94,0.15)",
                      }}
                    >
                      <p className="text-xs text-white/60">{n.message}</p>
                      <p className="text-xs text-white/25 mt-0.5">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <AddTruckModal
          onClose={() => setShowModal(false)}
          onTruckAdded={handleTruckAdded}
        />
      )}
    </div>
  );
}
