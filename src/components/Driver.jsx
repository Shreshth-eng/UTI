import { useState, useEffect } from "react";
import Sidebar from "../components/shared/Sidebar";
import Topbar from "../components/shared/Topbar";
import StatCard from "../components/shared/StatCard";
import Badge from "../components/shared/Badge";
import TrackingTimeline from "../components/shared/TrackingTimeline";
import {
  getMyProfile,
  getTrips,
  getShipments,
  updateShipmentStatus,
  completeTrip,
  getUser,
} from "../utils/api";

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

// Map backend trip statuses to timeline-friendly labels
const STATUS_LABELS = {
  pending: "Pending",
  "in-transit": "In Transit",
  delivered: "Delivered",
  delayed: "Delayed",
  completed: "Completed",
};

// Map backend trip status to badge-compatible status
const tripStatusToBadge = (status) => {
  const map = {
    "in-transit": "Active",
    pending: "Pending",
    delivered: "Delivered",
    completed: "Completed",
    delayed: "Delayed",
  };
  return map[status] || status;
};

// Build timeline steps from a shipment's tracking history
const buildTimelineSteps = (shipment) => {
  if (!shipment) return [];
  const steps = [];

  steps.push({
    label: "Trip Started",
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
        ? new Date(shipment.estimatedDelivery).toLocaleString()
        : "ETA",
      done: false,
    });
  }

  return steps;
};

function UpdateStatusModal({ shipmentId, tripId, onClose, onUpdated }) {
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    {
      label: "Reached Checkpoint",
      value: "in-transit",
      message: "Reached Checkpoint",
    },
    {
      label: "Delayed — Traffic",
      value: "delayed",
      message: "Delayed due to traffic",
    },
    {
      label: "Delivered Successfully",
      value: "delivered",
      message: "Delivered Successfully",
    },
    { label: "Issue Reported", value: "in-transit", message: "Issue Reported" },
  ];

  const handleUpdate = async () => {
    if (!selected) {
      alert("Please select a status");
      return;
    }
    const opt = statusOptions.find((o) => o.label === selected);
    setLoading(true);
    try {
      if (opt.value === "delivered" && tripId) {
        await completeTrip(tripId);
      }
      if (shipmentId) {
        await updateShipmentStatus(shipmentId, opt.value, opt.message);
      }
      onUpdated();
      onClose();
    } catch (err) {
      alert("Failed to update status. Please try again.");
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
            {statusOptions.map((s) => (
              <button
                key={s.label}
                onClick={() => setSelected(s.label)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                style={{
                  background:
                    selected === s.label
                      ? "rgba(168,85,247,0.15)"
                      : "rgba(255,255,255,0.03)",
                  border:
                    selected === s.label
                      ? "1px solid rgba(168,85,247,0.40)"
                      : "1px solid rgba(255,255,255,0.07)",
                  color:
                    selected === s.label ? "#d8b4fe" : "rgba(255,255,255,0.45)",
                }}
              >
                {s.label}
              </button>
            ))}
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
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 py-3 text-white text-sm font-black rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #a855f7, #7c3aed)",
                boxShadow: "0 0 20px rgba(168,85,247,0.3)",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Updating..." : "Update"}
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

  // Backend state
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileRes, tripsRes, shipmentsRes] = await Promise.all([
        getMyProfile(),
        getTrips(),
        getShipments(),
      ]);
      setProfile(profileRes);
      setTrips(Array.isArray(tripsRes) ? tripsRes : tripsRes.trips || []);
      setShipments(
        Array.isArray(shipmentsRes)
          ? shipmentsRes
          : shipmentsRes.shipments || [],
      );
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

  // Current (active) trip
  const currentTrip = trips.find(
    (t) => t.status === "in-transit" || t.status === "pending",
  );

  // Past trips (completed / delivered)
  const pastTrips = trips.filter(
    (t) => t.status === "completed" || t.status === "delivered",
  );

  // Shipment linked to current trip
  const currentShipment = currentTrip
    ? shipments.find(
        (s) => s._id === currentTrip.shipment || s.tripId === currentTrip._id,
      )
    : null;

  // Timeline steps for current shipment
  const timelineSteps = buildTimelineSteps(currentShipment);

  // Stats
  const totalEarned = pastTrips.reduce(
    (sum, t) => sum + (t.fare || t.earnings || 0),
    0,
  );
  const rating = profile?.rating ?? "—";
  const reviewCount = profile?.reviewCount ?? 0;

  // Progress calculation
  const coveredKm = currentTrip?.coveredDistance ?? currentTrip?.covered ?? 0;
  const totalKm = currentTrip?.distance ?? currentTrip?.totalDistance ?? 1;
  const progress = Math.min(100, Math.round((coveredKm / totalKm) * 100));

  // User info — fall back to localStorage while profile loads
  const localUser = getUser();
  const userName = profile?.name ?? localUser?.name ?? "Driver";
  const userPhone = profile?.phone ?? localUser?.phone ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // ── Notifications from recent tracking events ───────────────────
  const notifications = shipments
    .flatMap((s) =>
      (s.trackingHistory || []).slice(-1).map((h) => ({
        id: s._id,
        message: h.checkpointMessage || h.status,
        time: h.timestamp ? new Date(h.timestamp).toLocaleString() : "",
      })),
    )
    .slice(0, 5);

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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <Sidebar
        role="Driver"
        navItems={navItems}
        active={activeNav}
        setActive={setActiveNav}
        user={{ name: userName, initials, phone: userPhone }}
      />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <Topbar
          title="Driver Dashboard"
          subtitle="On The Road"
          notifications={notifications}
        />

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Trips Completed"
            value={pastTrips.length}
            sub="All time"
            accent="white"
            icon="🏁"
          />
          <StatCard
            label="Current Trip"
            value={currentTrip ? "Active" : "None"}
            sub={currentTrip?._id?.slice(-6)?.toUpperCase() ?? "—"}
            accent="purple"
            icon="🗺️"
          />
          <StatCard
            label="Total Earned"
            value={`₹${totalEarned.toLocaleString()}`}
            sub="This year"
            accent="green"
            icon="💰"
          />
          <StatCard
            label="My Rating"
            value={rating !== "—" ? `${rating} ⭐` : "—"}
            sub={reviewCount ? `${reviewCount} reviews` : "No reviews yet"}
            accent="orange"
            icon="🏆"
          />
        </div>

        {/* ── Current Trip + Timeline ── */}
        <div className="grid grid-cols-5 gap-5 mb-5">
          <div className="col-span-3" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">
                Current Trip
              </h2>
              <div className="flex items-center gap-3">
                <Badge
                  status={
                    currentTrip ? tripStatusToBadge(currentTrip.status) : "None"
                  }
                />
                {currentTrip && (
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
                )}
              </div>
            </div>

            {currentTrip ? (
              <>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    [
                      "Trip ID",
                      currentTrip._id?.slice(-6)?.toUpperCase() ?? "—",
                    ],
                    [
                      "Route",
                      `${currentTrip.from ?? currentShipment?.origin ?? "—"} → ${currentTrip.to ?? currentShipment?.destination ?? "—"}`,
                    ],
                    [
                      "ETA",
                      currentTrip.estimatedArrival
                        ? new Date(
                            currentTrip.estimatedArrival,
                          ).toLocaleDateString()
                        : currentShipment?.estimatedDelivery
                          ? new Date(
                              currentShipment.estimatedDelivery,
                            ).toLocaleDateString()
                          : "—",
                    ],
                    [
                      "Goods",
                      currentShipment?.goodsType ??
                        currentShipment?.description ??
                        "—",
                    ],
                    [
                      "Weight",
                      currentShipment?.weight
                        ? `${currentShipment.weight} kg`
                        : "—",
                    ],
                    [
                      "Truck",
                      currentTrip.truck?.registrationNumber ??
                        currentTrip.truckNumber ??
                        "—",
                    ],
                    ["Sender", currentShipment?.sender?.name ?? "—"],
                    ["Receiver", currentShipment?.receiver?.name ?? "—"],
                    [
                      "Started",
                      currentTrip.startTime
                        ? new Date(currentTrip.startTime).toLocaleString()
                        : currentTrip.createdAt
                          ? new Date(currentTrip.createdAt).toLocaleString()
                          : "—",
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
                      {coveredKm} km / {totalKm} km
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
              </>
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-white/30 text-sm">No active trip assigned</p>
              </div>
            )}
          </div>

          <div className="col-span-2" style={glassCard}>
            <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
              Trip Timeline
            </h2>
            {timelineSteps.length > 0 ? (
              <TrackingTimeline steps={timelineSteps} />
            ) : (
              <div className="flex items-center justify-center h-40">
                <p className="text-white/30 text-sm">No timeline events yet</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Past Trips ── */}
        <div style={glassCard}>
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-5">
            Past Trips
          </h2>
          {pastTrips.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {pastTrips.map((t) => {
                const linkedShipment = shipments.find(
                  (s) => s._id === t.shipment || s.tripId === t._id,
                );
                return (
                  <div
                    key={t._id}
                    className="rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white">
                        #{t._id?.slice(-6)?.toUpperCase() ?? "—"}
                      </span>
                      <Badge status={tripStatusToBadge(t.status)} />
                    </div>
                    <p className="text-xs text-white/50 mb-1">
                      {t.from ?? linkedShipment?.origin ?? "—"} →{" "}
                      {t.to ?? linkedShipment?.destination ?? "—"}
                    </p>
                    <p className="text-xs text-white/25 mb-3">
                      {t.completedAt
                        ? new Date(t.completedAt).toLocaleDateString()
                        : t.updatedAt
                          ? new Date(t.updatedAt).toLocaleDateString()
                          : "—"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black text-green-400">
                        ₹{(t.fare ?? t.earnings ?? 0).toLocaleString()}
                      </span>
                      {t.rating ? (
                        <span className="text-sm">
                          {"⭐".repeat(Math.min(t.rating, 5))}
                        </span>
                      ) : (
                        <span className="text-xs text-white/25">No rating</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24">
              <p className="text-white/30 text-sm">No past trips yet</p>
            </div>
          )}
        </div>
      </main>

      {showModal && currentTrip && (
        <UpdateStatusModal
          shipmentId={currentShipment?._id}
          tripId={currentTrip._id}
          onClose={() => setShowModal(false)}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
}
