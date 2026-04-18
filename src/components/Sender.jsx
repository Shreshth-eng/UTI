import { useState, useEffect } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import {
  getMyProfile,
  getShipments,
  createShipment,
  getUser,
  getNearbyTrucks,
  sendTruckRequest,
} from "../utils/api";

const navItems = [
  { label: "Overview", icon: "⊞" },
  { label: "Shipments", icon: "🚚" },
  { label: "Create Order", icon: "➕" },
  { label: "Analytics", icon: "📊" },
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

const normalizeStatus = (status) => {
  const map = {
    pending_pickup: "Pending",
    in_transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
    "in-transit": "In Transit",
    pending: "Pending",
    completed: "Delivered",
  };
  return map[status] || "Pending";
};

const buildTimelineSteps = (shipment) => {
  if (!shipment) return [];
  const steps = [];
  steps.push({
    label: "Order Placed",
    time: shipment.createdAt
      ? new Date(shipment.createdAt).toLocaleString()
      : "—",
    done: true,
  });
  if (shipment.checkpoints && shipment.checkpoints.length > 0) {
    shipment.checkpoints.forEach((entry) => {
      steps.push({
        label: entry.message || "Update",
        time: entry.timestamp
          ? new Date(entry.timestamp).toLocaleString()
          : "—",
        done: true,
      });
    });
  }
  if (shipment.status !== "delivered" && shipment.status !== "cancelled") {
    steps.push({
      label: "Delivery Pending",
      time: shipment.estimatedDelivery
        ? new Date(shipment.estimatedDelivery).toLocaleDateString()
        : "ETA TBD",
      done: false,
    });
  }
  return steps;
};

// ── Search Trucks Modal ─────────────────────────────────────────
function SearchTrucksModal({ shipment, onClose }) {
  const [step, setStep] = useState("idle");
  const [trucks, setTrucks] = useState([]);
  const [error, setError] = useState("");
  const [requestedId, setRequestedId] = useState(null);

  const handleSearch = () => {
    setStep("locating");
    setError("");
    if (!navigator.geolocation) {
      setError("GPS not supported on this device.");
      setStep("idle");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const result = await getNearbyTrucks(latitude, longitude, 100);
          setTrucks(Array.isArray(result) ? result : []);
          setStep("results");
        } catch {
          setError("Failed to fetch nearby trucks.");
          setStep("idle");
        }
      },
      () => {
        setError("Location access denied. Please allow GPS and try again.");
        setStep("idle");
      },
    );
  };

  const handleSendRequest = async (truck) => {
    if (!truck.assignedDriver) {
      setError("This truck has no driver assigned.");
      return;
    }
    setStep("requesting");
    setError("");
    try {
      const res = await sendTruckRequest(
        truck.assignedDriver._id,
        truck._id,
        shipment._id,
      );
      if (res?.message === "Request sent successfully") {
        setRequestedId(truck._id);
      } else {
        setError(res?.message || "Failed to send request.");
      }
      setStep("results");
    } catch {
      setError("Failed to send request. Try again.");
      setStep("results");
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-lg relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "1.5rem",
          padding: "2rem",
          backdropFilter: "blur(30px)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-black text-white">
              Search Nearby Trucks
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-xs text-white/40 mb-6">
            {shipment.origin} → {shipment.destination} ·{" "}
            {shipment.cargo?.description} · {shipment.cargo?.weight} kg
          </p>

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

          {step === "idle" && (
            <div className="text-center py-8">
              <p className="text-white/40 text-sm mb-6">
                Turn on GPS to find available trucks within 100 km radius.
              </p>
              <button
                onClick={handleSearch}
                className="px-8 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                  boxShadow: "0 0 20px rgba(59,130,246,0.3)",
                }}
              >
                Turn On GPS & Search
              </button>
            </div>
          )}

          {(step === "locating" || step === "requesting") && (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-white/50 text-sm animate-pulse">
                {step === "locating"
                  ? "Getting your location..."
                  : "Sending request to driver..."}
              </p>
            </div>
          )}

          {step === "results" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-white/40">
                  {trucks.length} truck{trucks.length !== 1 ? "s" : ""} found
                  nearby
                </p>
                <button
                  onClick={handleSearch}
                  className="text-xs text-blue-400 hover:text-blue-300 transition font-semibold"
                >
                  Refresh
                </button>
              </div>

              {trucks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/30 text-sm">
                    No available trucks found nearby.
                  </p>
                  <p className="text-white/20 text-xs mt-1">Try again later.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {trucks.map((truck) => (
                    <div
                      key={truck._id}
                      className="p-4 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border:
                          requestedId === truck._id
                            ? "1px solid rgba(34,197,94,0.35)"
                            : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-black text-white">
                              {truck.plateNumber}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-semibold"
                              style={{
                                background: "rgba(34,197,94,0.12)",
                                border: "1px solid rgba(34,197,94,0.25)",
                                color: "#86efac",
                              }}
                            >
                              Available
                            </span>
                          </div>
                          <p className="text-xs text-white/45 mb-1">
                            {truck.model} · {truck.capacity} kg capacity
                          </p>
                          {truck.assignedDriver ? (
                            <p className="text-xs text-white/35">
                              Driver: {truck.assignedDriver.name} ·{" "}
                              {truck.assignedDriver.phone}
                            </p>
                          ) : (
                            <p className="text-xs text-orange-400/70">
                              No driver assigned
                            </p>
                          )}
                          <p className="text-xs text-blue-400 mt-1 font-semibold">
                            {truck.distanceKm} km away
                          </p>
                        </div>
                        <div className="ml-3 shrink-0">
                          {requestedId === truck._id ? (
                            <span className="text-xs font-black text-green-400">
                              ✓ Sent
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSendRequest(truck)}
                              disabled={!truck.assignedDriver}
                              className="px-3 py-2 text-xs font-black rounded-xl transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{
                                background:
                                  "linear-gradient(135deg, #f97316, #ea580c)",
                                boxShadow: "0 0 12px rgba(249,115,22,0.25)",
                              }}
                            >
                              Send Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full mt-5 py-3 text-white/50 text-sm font-semibold rounded-xl transition hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.10)" }}
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Create Order Modal ──────────────────────────────────────────
function CreateOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    receiverName: "",
    cargoDescription: "",
    weight: "",
    pickupDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    if (
      !form.origin ||
      !form.destination ||
      !form.receiverName ||
      !form.cargoDescription ||
      !form.weight
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        origin: form.origin,
        destination: form.destination,
        receiverName: form.receiverName,
        cargo: {
          description: form.cargoDescription,
          weight: parseFloat(form.weight),
        },
        ...(form.pickupDate && {
          estimatedDelivery: new Date(form.pickupDate).toISOString(),
        }),
      };
      const res = await createShipment(payload);
      if (res?.message && res.message !== "Shipment created successfully") {
        setError(res.message || "Failed to create shipment.");
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError("Failed to create shipment. Please try again.");
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
        className="w-full max-w-lg relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "1.5rem",
          padding: "2rem",
          backdropFilter: "blur(30px)",
        }}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Create Shipment</h2>
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
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Origin City *
              </label>
              <input
                name="origin"
                value={form.origin}
                onChange={handle}
                placeholder="e.g. Delhi"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Destination City *
              </label>
              <input
                name="destination"
                value={form.destination}
                onChange={handle}
                placeholder="e.g. Amritsar"
                style={inputStyle}
              />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Receiver Name *
            </label>
            <input
              name="receiverName"
              value={form.receiverName}
              onChange={handle}
              placeholder="e.g. Rahul Sharma"
              style={inputStyle}
            />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Cargo Description *
              </label>
              <input
                name="cargoDescription"
                value={form.cargoDescription}
                onChange={handle}
                placeholder="e.g. Electronics"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Weight (kg) *
              </label>
              <input
                name="weight"
                type="number"
                value={form.weight}
                onChange={handle}
                placeholder="e.g. 500"
                style={inputStyle}
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Estimated Delivery Date
            </label>
            <input
              name="pickupDate"
              type="date"
              value={form.pickupDate}
              onChange={handle}
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
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating..." : "Create Shipment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Sender Dashboard ───────────────────────────────────────
export default function Sender() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, shipmentsRes] = await Promise.all([
        getMyProfile(),
        getShipments(),
      ]);
      setProfile(profileRes);
      const list = Array.isArray(shipmentsRes)
        ? shipmentsRes
        : shipmentsRes.shipments || [];
      setShipments(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0]._id);
    } catch {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filters = ["All", "In Transit", "Delivered", "Pending", "Cancelled"];
  const filtered =
    filter === "All"
      ? shipments
      : shipments.filter((s) => normalizeStatus(s.status) === filter);
  const selected = shipments.find((s) => s._id === selectedId);
  const timelineSteps = buildTimelineSteps(selected);
  const activeCount = shipments.filter((s) => s.status === "in_transit").length;
  const completedCount = shipments.filter(
    (s) => s.status === "delivered",
  ).length;
  const totalRevenue = shipments.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const notifications = shipments
    .flatMap((s) =>
      (s.checkpoints || [])
        .slice(-1)
        .map((h) => ({
          id: s._id,
          message: h.message || "Update",
          time: h.timestamp ? new Date(h.timestamp).toLocaleString() : "",
        })),
    )
    .slice(0, 5);
  const localUser = getUser();
  const userName = profile?.name ?? localUser?.name ?? "Sender";
  const userPhone = profile?.phone ?? localUser?.phone ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0a0f1e" }}
      >
        <p className="text-white/50 text-sm animate-pulse">
          Loading dashboard…
        </p>
      </div>
    );
  if (error)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0a0f1e" }}
      >
        <div className="text-center">
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button
            onClick={fetchData}
            className="text-xs text-white/50 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-orange-500/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/6 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        role="Sender"
        navItems={navItems}
        active={activeNav}
        setActive={(nav) => {
          setActiveNav(nav);
          if (nav === "Create Order") setShowModal(true);
        }}
        user={{ name: userName, initials, phone: userPhone }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Sender Dashboard"
          subtitle="Shipment Control Center"
          notifications={notifications}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Shipments"
            value={shipments.length}
            sub="All time"
            accent="white"
            icon="📦"
          />
          <StatCard
            label="Active"
            value={activeCount}
            sub="Moving now"
            accent="orange"
            icon="🚚"
          />
          <StatCard
            label="Completed"
            value={completedCount}
            sub="Delivered"
            accent="green"
            icon="✅"
          />
          <StatCard
            label="Revenue"
            value={`₹${totalRevenue.toLocaleString()}`}
            sub="Total"
            accent="blue"
            icon="💰"
          />
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Shipments
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-black text-white px-4 py-2 rounded-xl transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 0 15px rgba(249,115,22,0.25)",
                }}
              >
                + Create Order
              </button>
            </div>
            <div className="flex gap-2 mb-5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${filter === f ? "text-orange-300 border-orange-500/50 bg-orange-500/10" : "text-white/30 border-white/10 hover:border-white/20 hover:text-white/50"}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {filtered.length > 0 ? (
                filtered.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => setSelectedId(s._id)}
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background:
                        selectedId === s._id
                          ? "rgba(249,115,22,0.07)"
                          : "rgba(255,255,255,0.02)",
                      border:
                        selectedId === s._id
                          ? "1px solid rgba(249,115,22,0.20)"
                          : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-white">
                          #{s._id?.slice(-6)?.toUpperCase() ?? "—"}
                        </span>
                        <span className="text-xs text-white/25">
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                        <span className="text-xs font-bold text-orange-400 ml-auto">
                          {s.price ? `₹${s.price.toLocaleString()}` : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-white/45 truncate">
                        {s.origin ?? "—"} → {s.destination ?? "—"} ·{" "}
                        {s.cargo?.description ?? "—"} ·{" "}
                        {s.cargo?.weight ? `${s.cargo.weight} kg` : "—"}
                      </p>
                    </div>
                    <Badge status={normalizeStatus(s.status)} />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-white/30 text-sm">No shipments found</p>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-5">
            {selected ? (
              <>
                <div style={glassCard}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">
                      Details
                    </h2>
                    <Badge status={normalizeStatus(selected.status)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      ["From", selected.origin ?? "—"],
                      ["To", selected.destination ?? "—"],
                      ["Receiver", selected.receiverName ?? "—"],
                      [
                        "Price",
                        selected.price
                          ? `₹${selected.price.toLocaleString()}`
                          : "—",
                      ],
                      ["Cargo", selected.cargo?.description ?? "—"],
                      [
                        "Weight",
                        selected.cargo?.weight
                          ? `${selected.cargo.weight} kg`
                          : "—",
                      ],
                      [
                        "Driver",
                        selected.assignedDriver?.name ?? "Not Assigned",
                      ],
                      [
                        "Truck",
                        selected.assignedTruck?.plateNumber ?? "Not Assigned",
                      ],
                    ].map(([k, v]) => (
                      <div
                        key={k}
                        className="rounded-xl p-3"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <p className="text-xs text-white/30 uppercase tracking-wider mb-1">
                          {k}
                        </p>
                        <p className="text-xs font-bold text-white">{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Search Trucks button — pending shipments only */}
                  {!selected.assignedDriver &&
                    selected.status === "pending_pickup" && (
                      <button
                        onClick={() => setShowSearchModal(true)}
                        className="w-full py-2.5 text-white text-xs font-black rounded-xl transition hover:opacity-90"
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                          boxShadow: "0 0 15px rgba(59,130,246,0.25)",
                        }}
                      >
                        Search Nearby Trucks
                      </button>
                    )}
                </div>

                <div style={glassCard}>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                    Tracking
                  </h2>
                  {timelineSteps.length > 0 ? (
                    <TrackingTimeline steps={timelineSteps} />
                  ) : (
                    <div className="flex items-center justify-center h-24">
                      <p className="text-white/30 text-sm">
                        No tracking events yet
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={glassCard}
                className="flex items-center justify-center h-40"
              >
                <p className="text-white/30 text-sm">
                  Select a shipment to view details
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <CreateOrderModal
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
      {showSearchModal && selected && (
        <SearchTrucksModal
          shipment={selected}
          onClose={() => setShowSearchModal(false)}
        />
      )}
    </div>
  );
}
