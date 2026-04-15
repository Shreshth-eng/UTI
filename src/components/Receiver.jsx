import { useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import {
  receiverStats,
  receiverOrders,
  trackingSteps,
  receiverNotifications,
} from "../data/mockData";

const navItems = [
  { label: "Overview", icon: "⊞" },
  { label: "My Requests", icon: "📦" },
  { label: "Track Delivery", icon: "📍" },
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

function NewRequestModal({ onClose }) {
  const [form, setForm] = useState({
    from: "",
    to: "",
    goods: "",
    weight: "",
    date: "",
    notes: "",
  });
  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        <div className="absolute top-0 left-0 w-48 h-48 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">
              New Delivery Request
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition text-xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              ["from", "From City", "e.g. Delhi"],
              ["to", "To City", "e.g. Amritsar"],
            ].map(([name, label, ph]) => (
              <div key={name}>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                  {label}
                </label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handle}
                  placeholder={ph}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              ["goods", "Goods Type", "e.g. Electronics"],
              ["weight", "Weight (kg)", "e.g. 500"],
            ].map(([name, label, ph]) => (
              <div key={name}>
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                  {label}
                </label>
                <input
                  name={name}
                  value={form[name]}
                  onChange={handle}
                  placeholder={ph}
                  type={name === "weight" ? "number" : "text"}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <div className="mb-3">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Required By
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
              Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={handle}
              placeholder="Any special instructions..."
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
                  `Request submitted!\n${form.from} → ${form.to}\n${form.goods} · ${form.weight}kg`,
                );
                onClose();
              }}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                boxShadow: "0 0 20px rgba(59,130,246,0.3)",
              }}
            >
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Receiver() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedId, setSelectedId] = useState("ORD-1042");
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");

  const filters = ["All", "In Transit", "Delivered", "Pending"];
  const filtered =
    filter === "All"
      ? receiverOrders
      : receiverOrders.filter((o) => o.status === filter);
  const selectedOrder = receiverOrders.find((o) => o.id === selectedId);

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/6 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        role="Receiver"
        navItems={navItems}
        active={activeNav}
        setActive={setActiveNav}
        user={{
          name: "Rahul Sharma",
          initials: "RS",
          phone: "+91 98765 43210",
        }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Good morning, Rahul 👋"
          subtitle="Receiver Dashboard"
          notifications={receiverNotifications}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Requests"
            value={receiverStats.total}
            sub="All time"
            accent="white"
            icon="📋"
          />
          <StatCard
            label="In Transit"
            value={receiverStats.inTransit}
            sub="Active now"
            accent="blue"
            icon="🚛"
          />
          <StatCard
            label="Delivered"
            value={receiverStats.delivered}
            sub="Completed"
            accent="green"
            icon="✅"
          />
          <StatCard
            label="Pending"
            value={receiverStats.pending}
            sub="Awaiting"
            accent="orange"
            icon="⏳"
          />
        </div>

        <div className="grid grid-cols-5 gap-5">
          <div className="col-span-3" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                My Orders
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="text-xs font-black text-white px-4 py-2 rounded-xl transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                  boxShadow: "0 0 15px rgba(59,130,246,0.25)",
                }}
              >
                + New Request
              </button>
            </div>

            <div className="flex gap-2 mb-5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                    filter === f
                      ? "text-white border-blue-500/50 bg-blue-500/15"
                      : "text-white/30 border-white/10 hover:border-white/20 hover:text-white/50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background:
                      selectedId === order.id
                        ? "rgba(59,130,246,0.08)"
                        : "rgba(255,255,255,0.02)",
                    border:
                      selectedId === order.id
                        ? "1px solid rgba(59,130,246,0.20)"
                        : "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black text-white">
                        #{order.id}
                      </span>
                      <span className="text-xs text-white/25">
                        {order.date}
                      </span>
                    </div>
                    <p className="text-xs text-white/45 truncate">
                      {order.from} → {order.to} · {order.goods} · {order.weight}
                    </p>
                  </div>
                  <Badge status={order.status} />
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2" style={glassCard}>
            {selectedOrder ? (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">
                    Live Tracking
                  </h2>
                  <Badge status={selectedOrder.status} />
                </div>

                <div
                  className="rounded-xl p-4 mb-5 grid grid-cols-2 gap-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {[
                    ["Route", `${selectedOrder.from} → ${selectedOrder.to}`],
                    ["ETA", selectedOrder.eta],
                    ["Driver", selectedOrder.driver],
                    ["Truck", selectedOrder.truck],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs text-white/30 mb-0.5 uppercase tracking-wider">
                        {k}
                      </p>
                      <p className="text-xs font-bold text-white">{v}</p>
                    </div>
                  ))}
                </div>

                <TrackingTimeline steps={trackingSteps} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-48">
                <p className="text-sm text-white/25">
                  Select an order to track
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && <NewRequestModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
