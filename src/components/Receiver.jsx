import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import {
  getShipments,
  getMyNotifications,
  updateShipmentStatus,
  getUser,
  getMyProfile,
} from "../utils/api";

const navItems = [
  { label: "Overview", icon: "⊞" },
  { label: "My Deliveries", icon: "📦" },
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

// Backend status → display label
const formatStatus = (s) =>
  ({
    in_transit: "In Transit",
    delivered: "Delivered",
    pending_pickup: "Pending",
    cancelled: "Cancelled",
  })[s] || s;

// Build timeline from checkpoints
const buildTimeline = (shipment) => {
  if (!shipment) return [];
  const steps = [];

  steps.push({
    label: "Order Placed",
    time: shipment.createdAt
      ? new Date(shipment.createdAt).toLocaleString()
      : "—",
    done: true,
  });

  if (shipment.checkpoints?.length > 0) {
    shipment.checkpoints.forEach((cp) => {
      steps.push({
        label: cp.message || "Update",
        time: cp.timestamp ? new Date(cp.timestamp).toLocaleString() : "—",
        done: true,
      });
    });
  }

  if (shipment.status !== "delivered" && shipment.status !== "cancelled") {
    steps.push({
      label: "Awaiting Delivery",
      time: shipment.estimatedDelivery
        ? new Date(shipment.estimatedDelivery).toLocaleDateString()
        : "ETA TBD",
      done: false,
    });
  }

  if (shipment.status === "delivered") {
    steps.push({ label: "Delivered Successfully", time: "", done: true });
  }

  return steps;
};

export default function Receiver() {
  const localUser = getUser();

  const [activeNav, setActiveNav] = useState("Overview");
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("All");

  const [shipments, setShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  // ── Fetch all shipments where I am receiver ───
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getShipments();
      const list = Array.isArray(res) ? res : res?.shipments || [];
      setShipments(list);
      if (list.length > 0 && !selectedId) setSelectedId(list[0]._id);
    } catch {
      setError("Could not load deliveries.");
    } finally {
      setLoading(false);
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
    fetchShipments();
    fetchNotifications();
    fetchProfile();
    // Poll every 30 sec — live tracking updates
    const interval = setInterval(() => {
      fetchShipments();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchShipments, fetchNotifications, fetchProfile]);

  // ── Receiver confirms delivery received ───────
  const handleConfirmDelivery = async (shipmentId) => {
    setConfirmingId(shipmentId);
    try {
      await updateShipmentStatus(
        shipmentId,
        "delivered",
        "Delivery confirmed by receiver",
      );
      fetchShipments();
    } catch {
      alert("Failed to confirm. Please try again.");
    } finally {
      setConfirmingId(null);
    }
  };

  // ── Derived ───────────────────────────────────
  const filters = ["All", "In Transit", "Delivered", "Pending"];

  const filtered =
    filter === "All"
      ? shipments
      : shipments.filter((s) => formatStatus(s.status) === filter);

  const selected = shipments.find((s) => s._id === selectedId);
  const timelineSteps = buildTimeline(selected);

  const stats = {
    total: shipments.length,
    inTransit: shipments.filter((s) => s.status === "in_transit").length,
    delivered: shipments.filter((s) => s.status === "delivered").length,
    pending: shipments.filter((s) => s.status === "pending_pickup").length,
  };

  const unreadNotifs = notifications
    .filter((n) => !n.read)
    .slice(0, 5)
    .map((n) => ({
      id: n._id,
      message: n.message,
      time: new Date(n.createdAt).toLocaleString(),
    }));

  const userName = profile?.name ?? localUser?.name ?? "User";
  const firstName = userName.split(" ")[0];
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const userPhone = profile?.phone ?? localUser?.phone ?? "";

  if (loading)
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: "#0a0f1e" }}
      >
        <p className="text-white/50 text-sm animate-pulse">
          Loading deliveries…
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
            onClick={fetchShipments}
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
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/6 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        role="Receiver"
        navItems={navItems}
        active={activeNav}
        setActive={setActiveNav}
        user={{ name: userName, initials, phone: userPhone }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title={`Hello, ${firstName} 👋`}
          subtitle="Track your incoming deliveries"
          notifications={unreadNotifs}
        />

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Deliveries"
            value={stats.total}
            sub="All time"
            accent="white"
            icon="📦"
          />
          <StatCard
            label="In Transit"
            value={stats.inTransit}
            sub="On the way"
            accent="blue"
            icon="🚛"
          />
          <StatCard
            label="Delivered"
            value={stats.delivered}
            sub="Completed"
            accent="green"
            icon="✅"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            sub="Not started"
            accent="orange"
            icon="⏳"
          />
        </div>

        <div className="grid grid-cols-5 gap-5">
          {/* ── Deliveries List ── */}
          <div className="col-span-3" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                My Deliveries
              </h2>
              {/* No "New Request" button — receiver doesn't create shipments */}
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 mb-5">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-all ${
                    filter === f
                      ? "text-blue-300 border-blue-500/50 bg-blue-500/10"
                      : "text-white/30 border-white/10 hover:border-white/20 hover:text-white/50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Shipments list */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <p className="text-white/25 text-sm">No deliveries found</p>
                <p className="text-white/15 text-xs">
                  Deliveries sent to you will appear here
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {filtered.map((s) => (
                  <div
                    key={s._id}
                    onClick={() => setSelectedId(s._id)}
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background:
                        selectedId === s._id
                          ? "rgba(59,130,246,0.08)"
                          : "rgba(255,255,255,0.02)",
                      border:
                        selectedId === s._id
                          ? "1px solid rgba(59,130,246,0.20)"
                          : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-black text-white">
                          #{s._id?.slice(-6)?.toUpperCase()}
                        </span>
                        <span className="text-xs text-white/25">
                          {s.createdAt
                            ? new Date(s.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <p className="text-xs text-white/45 truncate">
                        {s.origin ?? "—"} → {s.destination ?? "—"} ·{" "}
                        {s.cargo?.description ?? "—"} ·{" "}
                        {s.cargo?.weight ? `${s.cargo.weight} kg` : "—"}
                      </p>
                    </div>
                    <Badge status={formatStatus(s.status)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Live Tracking Panel ── */}
          <div className="col-span-2 flex flex-col gap-5">
            {selected ? (
              <>
                {/* Details card */}
                <div style={glassCard}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">
                      Details
                    </h2>
                    <Badge status={formatStatus(selected.status)} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      ["From", selected.origin ?? "—"],
                      ["To", selected.destination ?? "—"],
                      ["Cargo", selected.cargo?.description ?? "—"],
                      [
                        "Weight",
                        selected.cargo?.weight
                          ? `${selected.cargo.weight} kg`
                          : "—",
                      ],
                      [
                        "Driver",
                        selected.assignedDriver?.name ?? "Not assigned",
                      ],
                      [
                        "Truck",
                        selected.assignedTruck?.plateNumber ?? "Not assigned",
                      ],
                      [
                        "ETA",
                        selected.estimatedDelivery
                          ? new Date(
                              selected.estimatedDelivery,
                            ).toLocaleDateString()
                          : "TBD",
                      ],
                      ["Sender", selected.sender?.name ?? "—"],
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

                  {/* Confirm Delivery button — only when in_transit */}
                  {selected.status === "in_transit" && (
                    <button
                      onClick={() => handleConfirmDelivery(selected._id)}
                      disabled={confirmingId === selected._id}
                      className="w-full py-2.5 text-white text-xs font-black rounded-xl transition hover:opacity-90 disabled:opacity-50"
                      style={{
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        boxShadow: "0 0 15px rgba(34,197,94,0.25)",
                      }}
                    >
                      {confirmingId === selected._id
                        ? "Confirming..."
                        : "✓ Confirm Delivery Received"}
                    </button>
                  )}

                  {selected.status === "delivered" && (
                    <div
                      className="w-full py-2.5 text-center text-xs font-black rounded-xl text-green-400"
                      style={{
                        background: "rgba(34,197,94,0.08)",
                        border: "1px solid rgba(34,197,94,0.20)",
                      }}
                    >
                      ✓ Delivery Completed
                    </div>
                  )}
                </div>

                {/* Timeline / tracking */}
                <div style={glassCard}>
                  <h2 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                    Live Tracking
                  </h2>
                  {timelineSteps.length > 0 ? (
                    <TrackingTimeline steps={timelineSteps} />
                  ) : (
                    <div className="flex items-center justify-center h-24">
                      <p className="text-white/30 text-sm">
                        No tracking updates yet
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-white/20 text-center mt-3">
                    Auto-refreshes every 30 seconds
                  </p>
                </div>
              </>
            ) : (
              <div
                style={glassCard}
                className="flex items-center justify-center h-40"
              >
                <p className="text-white/30 text-sm">
                  Select a delivery to track
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
