export default function Sidebar({ role, navItems, active, setActive, user }) {
  const accent = {
    Receiver: {
      glow: "bg-blue-600/15",
      pill: "bg-blue-500/10 border-blue-500/25 text-blue-300",
      avatarBg: "bg-blue-600",
      activeItem: "bg-blue-500/10 border-blue-500/20 text-blue-300",
    },
    Sender: {
      glow: "bg-orange-500/15",
      pill: "bg-orange-500/10 border-orange-500/25 text-orange-300",
      avatarBg: "bg-orange-500",
      activeItem: "bg-orange-500/10 border-orange-500/20 text-orange-300",
    },
    "Truck Owner": {
      glow: "bg-green-500/15",
      pill: "bg-green-500/10 border-green-500/25 text-green-300",
      avatarBg: "bg-green-600",
      activeItem: "bg-green-500/10 border-green-500/20 text-green-300",
    },
    Driver: {
      glow: "bg-purple-500/15",
      pill: "bg-purple-500/10 border-purple-500/25 text-purple-300",
      avatarBg: "bg-purple-600",
      activeItem: "bg-purple-500/10 border-purple-500/20 text-purple-300",
    },
  };
  const a = accent[role] || accent.Receiver;

  return (
    <aside
      className="w-64 min-h-screen shrink-0 relative flex flex-col px-4 py-6"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        className={`absolute top-0 left-0 w-56 h-56 ${a.glow} rounded-full blur-[90px] pointer-events-none`}
      />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/2 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10 mb-8 px-2">
        <p
          className="text-3xl font-black mb-1"
          style={{
            background: "linear-gradient(135deg, #60a5fa, #fb923c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          UTI
        </p>
        <p className="text-white/30 text-xs mb-2">
          Unified Transport Interface
        </p>
        <span
          className={`inline-block text-xs px-3 py-1 rounded-full border font-semibold ${a.pill}`}
        >
          {role}
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 relative z-10">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left w-full border ${
              active === item.label
                ? `${a.activeItem} border font-semibold`
                : "text-white/40 border-transparent hover:bg-white/5 hover:text-white/70"
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div
        className="relative z-10"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.07)",
          paddingTop: "1rem",
        }}
      >
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition cursor-pointer">
          <div
            className={`w-9 h-9 rounded-full ${a.avatarBg} flex items-center justify-center text-xs font-black text-white shrink-0 shadow-lg`}
          >
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-white/30 truncate">{user.phone}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
