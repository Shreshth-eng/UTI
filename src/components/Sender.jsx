import { useState, useEffect } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import { getMyProfile, getShipments, createShipment, getUser } from "../utils/api";

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

// Map backend status → filter label
const normalizeStatus = (status) => {
  const map = {
    "in-transit": "In Transit",
    delivered: "Delivered",
    pending: "Pending",
    completed: "Delivered",
    delayed: "In Transit",
  };
  return map[status] || "Pending";
};

// Build timeline steps from shipment tracking history
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

  if (shipment.trackingHistory && shipment.trackingHistory.length > 0) {
    shipment.trackingHistory.forEach((entry) => {
      steps.push({
        label: entry.checkpointMessage || entry.status,
        time: entry.timestamp
          ? new Date(entry.timestamp).toLocaleString()
          : "—",
        done: true,
      });
    });
  }

  if (shipment.status !== "delivered" && shipment.status !== "completed") {
    steps.push({
      label: "Delivery Pending",
      time: shipment.estimatedDelivery
        ? new Date(shipment.estimatedDelivery).toLocaleDateString()
        : "ETA",
      done: false,
    });
  }

  return steps;
};

function CreateOrderModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    to: "",
    goods: "",
    weight: "",
    truckType: "",
    date: "",
    instructions: "",
  });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async () => {
    if (!form.to || !form.goods || !form.weight) {
      alert("Please fill in Destination, Goods, and Weight.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        destination: form.to,
        goodsType: form.goods,
        weight: parseFloat(form.weight),
        truckType: form.truckType,
        pickupDate: form.date,
        specialInstructions: form.instructions,
      };
      const res = await createShipment(payload);
      if (res?.error || res?.message?.toLowerCase().includes("error")) {
        alert(res.error || res.message || "Failed to create shipment.");
        return;
      }
      onCreated();
      onClose();
    } catch (err) {
      alert("Failed to create shipment. Please try again.");
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

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Destination City
              </label>
              <input
                name="to"
                value={form.to}
                onChange={handle}
                placeholder="e.g. Amritsar"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Type of Goods
              </label>
              <input
                name="goods"
                value={form.goods}
                onChange={handle}
                placeholder="e.g. Electronics"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Weight (kg)
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
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                Truck Type
              </label>
              <select
                name="truckType"
                value={form.truckType}
                onChange={handle}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="" style={{ background: "#0a0f1e" }}>
                  Select type
                </option>
                <option value="Light" style={{ background: "#0a0f1e" }}>
                  Light (up to 3 Ton)
                </option>
                <option value="Medium" style={{ background: "#0a0f1e" }}>
                  Medium (up to 10 Ton)
                </option>
                <option value="Heavy" style={{ background: "#0a0f1e" }}>
                  Heavy (up to 20 Ton)
                </option>
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Pickup Date
            </label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handle}
              style={inputStyle}
            />
          </div>

          <div className="mb-6">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Special Instructions
            </label>
            <textarea
              name="instructions"
              rows={3}
              value={form.instructions}
              onChange={handle}
              placeholder="Fragile items, temperature requirements..."
              style={{ ...inputStyle, resize: "none" }}
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
                boxShadow: "0 0 20px rgba(249,115,22,0.3)",
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

export default function Sender() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedId, setSelectedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  // Backend state
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
      // Auto-select first shipment
      if (list.length > 0 && !selectedId) {
        setSelectedId(list[0]._id);
      }
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Derived data ────────────────────────────────────────────────

  const filters = ["All", "In Transit", "Delivered", "Pending"];

  const filtered =
    filter === "All"
      ? shipments
      : shipments.filter((s) => normalizeStatus(s.status) === filter);

  const selected = shipments.find((s) => s._id === selectedId);
  const timelineSteps = buildTimelineSteps(selected);

  // Stats
  const activeCount = shipments.filter(
    (s) => s.status === "in-transit" || s.status === "delayed",
  ).length;
  const completedCount = shipments.filter(
    (s) => s.status === "delivered" || s.status === "completed",
  ).length;
  const totalRevenue = shipments.reduce(
    (sum, s) => sum + (s.amount ?? s.fare ?? s.cost ?? 0),
    0,
  );

  // Notifications from tracking history
  const notifications = shipments
    .flatMap((s) =>
      (s.trackingHistory || []).slice(-1).map((h) => ({
        id: s._id,
        message: h.checkpointMessage || h.status,
        time: h.timestamp ? new Date(h.timestamp).toLocaleString() : "",
      })),
    )
    .slice(0, 5);

  // User info
  const localUser = getUser();
  const userName = profile?.name ?? localUser?.name ?? "Sender";
  const userPhone = profile?.phone ?? localUser?.phone ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ── Render ──────────────────────────────────────────────────────

  if (loading) {
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
  }

  if (error) {
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
  }

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

        {/* ── Stat Cards ── */}
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
            sub="This month"
            accent="blue"
            icon="💰"
          />
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* ── Shipments List ── */}
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
                  className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                    filter === f
                      ? "text-orange-300 border-orange-500/50 bg-orange-500/10"
                      : "text-white/30 border-white/10 hover:border-white/20 hover:text-white/50"
                  }`}
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
                          {s.amount || s.fare || s.cost
                            ? `₹${(s.amount ?? s.fare ?? s.cost).toLocaleString()}`
                            : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-white/45 truncate">
                        To {s.destination ?? s.to ?? "—"} ·{" "}
                        {s.goodsType ?? s.goods ?? "—"} ·{" "}
                        {s.weight ? `${s.weight} kg` : "—"}
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

          {/* ── Details + Tracking ── */}
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
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["To", selected.destination ?? selected.to ?? "—"],
                      [
                        "Amount",
                        selected.amount || selected.fare || selected.cost
                          ? `₹${(selected.amount ?? selected.fare ?? selected.cost).toLocaleString()}`
                          : "—",
                      ],
                      ["Goods", selected.goodsType ?? selected.goods ?? "—"],
                      [
                        "Weight",
                        selected.weight ? `${selected.weight} kg` : "—",
                      ],
                      [
                        "Driver",
                        selected.driver?.name ??
                          selected.driverName ??
                          "Not Assigned",
                      ],
                      [
                        "Truck",
                        selected.truck?.registrationNumber ??
                          selected.truckNumber ??
                          "Not Assigned",
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
    </div>
  );
}
