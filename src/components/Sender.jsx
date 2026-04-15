import { useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import {
  senderStats,
  senderShipments,
  trackingSteps,
  senderNotifications,
} from "../data/mockData";

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

function CreateOrderModal({ onClose }) {
  const [form, setForm] = useState({
    to: "",
    goods: "",
    weight: "",
    truckType: "",
    date: "",
    instructions: "",
  });
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
              className="flex-1 py-3 text-white/50 text-sm font-semibold rounded-xl transition hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                alert(
                  `Shipment created!\nTo: ${form.to}\n${form.goods} · ${form.weight}kg`,
                );
                onClose();
              }}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 0 20px rgba(249,115,22,0.3)",
              }}
            >
              Create Shipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sender() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedId, setSelectedId] = useState("SHP-2041");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  const filters = ["All", "In Transit", "Delivered", "Pending"];
  const filtered =
    filter === "All"
      ? senderShipments
      : senderShipments.filter((s) => s.status === filter);
  const selected = senderShipments.find((s) => s.id === selectedId);

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
        user={{
          name: "Sharma Exports",
          initials: "SE",
          phone: "+91 98001 11222",
        }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Sender Dashboard"
          subtitle="Shipment Control Center"
          notifications={senderNotifications}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Shipments"
            value={senderStats.totalShipments}
            sub="All time"
            accent="white"
            icon="📦"
          />
          <StatCard
            label="Active"
            value={senderStats.active}
            sub="Moving now"
            accent="orange"
            icon="🚚"
          />
          <StatCard
            label="Completed"
            value={senderStats.completed}
            sub="Delivered"
            accent="green"
            icon="✅"
          />
          <StatCard
            label="Revenue"
            value={senderStats.revenue}
            sub="This month"
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
              {filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background:
                      selectedId === s.id
                        ? "rgba(249,115,22,0.07)"
                        : "rgba(255,255,255,0.02)",
                    border:
                      selectedId === s.id
                        ? "1px solid rgba(249,115,22,0.20)"
                        : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-white">
                        #{s.id}
                      </span>
                      <span className="text-xs text-white/25">{s.date}</span>
                      <span className="text-xs font-bold text-orange-400 ml-auto">
                        {s.amount}
                      </span>
                    </div>
                    <p className="text-xs text-white/45 truncate">
                      To {s.to} · {s.goods} · {s.weight}
                    </p>
                  </div>
                  <Badge status={s.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 flex flex-col gap-5">
            {selected && (
              <>
                <div style={glassCard}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">
                      Details
                    </h2>
                    <Badge status={selected.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["To", selected.to],
                      ["Amount", selected.amount],
                      ["Goods", selected.goods],
                      ["Weight", selected.weight],
                      ["Driver", selected.driver],
                      ["Truck", selected.truck],
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
                  <TrackingTimeline steps={trackingSteps} />
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {showModal && <CreateOrderModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
