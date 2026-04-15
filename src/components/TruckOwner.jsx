import { useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import {
  truckOwnerStats,
  trucks,
  truckRequests,
  truckOwnerNotifications,
} from "../data/mockData";

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

function AddTruckModal({ onClose }) {
  const [form, setForm] = useState({
    number: "",
    type: "",
    capacity: "",
    driver: "",
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
          {[
            ["number", "Truck Number", "e.g. PB-10-AB-1234"],
            ["capacity", "Capacity (Ton)", "e.g. 15"],
            ["driver", "Assigned Driver", "e.g. Harjeet Singh"],
          ].map(([name, label, ph]) => (
            <div key={name} className="mb-3">
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
          <div className="mb-6">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
              Truck Type
            </label>
            <select
              name="type"
              value={form.type}
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
                alert(`Truck ${form.number} added!`);
                onClose();
              }}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                boxShadow: "0 0 20px rgba(34,197,94,0.3)",
              }}
            >
              Add Truck
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
  const [requests, setRequests] = useState(truckRequests);

  const handleRequest = (id, action) => {
    alert(
      `${action === "accept" ? "✅ Accepted" : "❌ Rejected"} request ${id}`,
    );
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

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
        user={{
          name: "Gurpreet Fleets",
          initials: "GF",
          phone: "+91 97300 55566",
        }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Fleet Dashboard"
          subtitle="Truck Owner Portal"
          notifications={truckOwnerNotifications}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Trucks"
            value={truckOwnerStats.totalTrucks}
            sub="In fleet"
            accent="white"
            icon="🚛"
          />
          <StatCard
            label="On Trip"
            value={truckOwnerStats.activeTrips}
            sub="Currently active"
            accent="blue"
            icon="📍"
          />
          <StatCard
            label="Available"
            value={truckOwnerStats.available}
            sub="Ready to assign"
            accent="green"
            icon="✅"
          />
          <StatCard
            label="Maintenance"
            value={truckOwnerStats.maintenance}
            sub="Under repair"
            accent="red"
            icon="🔧"
          />
        </div>

        <div className="grid grid-cols-3 gap-5 mb-5">
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
              {trucks.map((truck) => (
                <div
                  key={truck.id}
                  className="p-4 rounded-xl transition-all duration-200"
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
                          {truck.number}
                        </span>
                        <span className="text-xs text-white/25">
                          · {truck.type} · {truck.capacity}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">
                        {truck.driver} · {truck.location}
                      </p>
                      {truck.trip !== "—" && (
                        <p className="text-xs text-green-400 mt-1 font-semibold">
                          📍 {truck.trip}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge status={truck.status} />
                      {truck.earning !== "—" && (
                        <span className="text-xs text-orange-400 font-bold">
                          {truck.earning}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={glassCard}>
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
              Booking Requests
              {requests.length > 0 && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-bold bg-orange-500/15 text-orange-300 border border-orange-500/25">
                  {requests.length}
                </span>
              )}
            </h2>

            {requests.length === 0 ? (
              <p className="text-sm text-white/25 text-center mt-8">
                No pending requests
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white">
                        #{req.id}
                      </span>
                      <span className="text-xs font-bold text-orange-400">
                        {req.amount}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white/70 mb-1">
                      {req.from} → {req.to}
                    </p>
                    <p className="text-xs text-white/35 mb-1">
                      {req.goods} · {req.weight}
                    </p>
                    <p className="text-xs text-white/25 mb-3">
                      By {req.date} · {req.sender}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRequest(req.id, "accept")}
                        className="flex-1 py-1.5 text-xs font-black rounded-lg transition hover:opacity-90"
                        style={{
                          background: "rgba(34,197,94,0.15)",
                          border: "1px solid rgba(34,197,94,0.30)",
                          color: "#86efac",
                        }}
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, "reject")}
                        className="flex-1 py-1.5 text-xs font-black rounded-lg transition hover:opacity-90"
                        style={{
                          background: "rgba(239,68,68,0.15)",
                          border: "1px solid rgba(239,68,68,0.30)",
                          color: "#fca5a5",
                        }}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && <AddTruckModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
