import { useState } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import {
  driverStats,
  driverCurrentTrip,
  driverTripSteps,
  driverPastTrips,
  driverNotifications,
} from "../data/mockData";

const navItems = [
  { label: "Overview", icon: "⊞" },
  { label: "Current Trip", icon: "🗺️" },
  { label: "Past Trips", icon: "📜" },
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

function UpdateStatusModal({ onClose }) {
  const [selected, setSelected] = useState("");
  const statuses = [
    "Reached Checkpoint",
    "Delayed — Traffic",
    "Delivered Successfully",
    "Issue Reported",
  ];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "1.5rem",
          padding: "2rem",
          backdropFilter: "blur(30px)",
        }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[70px] pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-white">Update Status</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition text-xl"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-2 mb-6">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setSelected(s)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background:
                    selected === s
                      ? "rgba(168,85,247,0.15)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    selected === s
                      ? "1px solid rgba(168,85,247,0.40)"
                      : "1px solid rgba(255,255,255,0.07)",
                  color: selected === s ? "#d8b4fe" : "rgba(255,255,255,0.45)",
                }}
              >
                {s}
              </button>
            ))}
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
                if (selected) {
                  alert(`Status updated: ${selected}`);
                  onClose();
                } else alert("Please select a status");
              }}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                boxShadow: "0 0 20px rgba(168,85,247,0.3)",
              }}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DriverDashboard() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [showModal, setShowModal] = useState(false);
  const trip = driverCurrentTrip;
  const progress = Math.round(
    (parseInt(trip.covered) / parseInt(trip.distance)) * 100,
  );

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "#0a0f1e", fontFamily: "system-ui, sans-serif" }}
    >
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        role="Driver"
        navItems={navItems}
        active={activeNav}
        setActive={setActiveNav}
        user={{
          name: "Harjeet Singh",
          initials: "HS",
          phone: "+91 95555 77788",
        }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Driver Dashboard"
          subtitle="On The Road"
          notifications={driverNotifications}
        />

        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Trips Completed"
            value={driverStats.tripsCompleted}
            sub="All time"
            accent="white"
            icon="🏁"
          />
          <StatCard
            label="Current Trip"
            value={driverStats.currentTrip}
            sub={trip.id}
            accent="purple"
            icon="🗺️"
          />
          <StatCard
            label="Total Earned"
            value={driverStats.totalEarned}
            sub="This year"
            accent="green"
            icon="💰"
          />
          <StatCard
            label="My Rating"
            value={`${driverStats.rating} ⭐`}
            sub="47 reviews"
            accent="orange"
            icon="🏆"
          />
        </div>

        <div className="grid grid-cols-5 gap-5 mb-5">
          <div className="col-span-3" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Current Trip
              </h2>
              <div className="flex items-center gap-3">
                <Badge status="Active" />
                <button
                  onClick={() => setShowModal(true)}
                  className="text-xs font-black text-white px-4 py-2 rounded-xl transition hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                    boxShadow: "0 0 15px rgba(168,85,247,0.25)",
                  }}
                >
                  Update Status
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                ["Trip ID", trip.id],
                ["Route", `${trip.from} → ${trip.to}`],
                ["ETA", trip.eta],
                ["Goods", trip.goods],
                ["Weight", trip.weight],
                ["Truck", trip.truck],
                ["Sender", trip.sender],
                ["Receiver", trip.receiver],
                ["Started", trip.startTime],
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

            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(168,85,247,0.05)",
                border: "1px solid rgba(168,85,247,0.15)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
                  Trip Progress
                </p>
                <p className="text-xs font-black text-purple-400">
                  {trip.covered} / {trip.distance}
                </p>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                    boxShadow: "0 0 10px rgba(168,85,247,0.5)",
                  }}
                />
              </div>
              <p className="text-xs text-white/25 mt-2">
                {progress}% of journey completed
              </p>
            </div>
          </div>

          <div className="col-span-2" style={glassCard}>
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
              Trip Timeline
            </h2>
            <TrackingTimeline steps={driverTripSteps} />
          </div>
        </div>

        <div style={glassCard}>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
            Past Trips
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {driverPastTrips.map((t) => (
              <div
                key={t.id}
                className="rounded-xl p-4"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-white">#{t.id}</span>
                  <Badge status={t.status} />
                </div>
                <p className="text-xs text-white/50 mb-1">
                  {t.from} → {t.to}
                </p>
                <p className="text-xs text-white/25 mb-3">{t.date}</p>
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-green-400">
                    {t.earned}
                  </span>
                  <span className="text-sm">{"⭐".repeat(t.rating)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {showModal && <UpdateStatusModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
