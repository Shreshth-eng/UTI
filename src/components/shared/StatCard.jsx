export default function StatCard({ label, value, sub, accent, icon }) {
  const colors = {
    blue: {
      text: "text-blue-400",
      glow: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.15)",
    },
    orange: {
      text: "text-orange-400",
      glow: "rgba(249,115,22,0.08)",
      border: "rgba(249,115,22,0.15)",
    },
    green: {
      text: "text-green-400",
      glow: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.15)",
    },
    purple: {
      text: "text-purple-400",
      glow: "rgba(168,85,247,0.08)",
      border: "rgba(168,85,247,0.15)",
    },
    red: {
      text: "text-red-400",
      glow: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.15)",
    },
    white: {
      text: "text-white",
      glow: "rgba(255,255,255,0.03)",
      border: "rgba(255,255,255,0.08)",
    },
  };
  const c = colors[accent] || colors.white;

  return (
    <div
      className="relative rounded-2xl px-5 py-4 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))`,
        border: `1px solid ${c.border}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{ background: c.glow }}
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">
            {label}
          </p>
          {icon && <span className="text-lg opacity-60">{icon}</span>}
        </div>
        <p className={`text-3xl font-black ${c.text}`}>{value}</p>
        {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
