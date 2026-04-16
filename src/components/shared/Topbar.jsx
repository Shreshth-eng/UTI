import { useState } from "react";

export default function Topbar({ title, subtitle, notifications = [] }) {
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-1">
          {subtitle}
        </p>
        <h1 className="text-2xl font-black text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="text-white/60 text-sm">🔔</span>
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-black shadow-lg shadow-orange-500/30">
                {unread}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-12 w-80 z-50 overflow-hidden rounded-2xl"
              style={{
                background: "rgba(15,18,32,0.95)",
                border: "1px solid rgba(255,255,255,0.10)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              }}
            >
              <div
                className="px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-sm font-bold text-white">Notifications</p>
              </div>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 transition-colors ${!n.read ? "bg-blue-500/5" : ""}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block mr-2 mb-0.5" />
                  )}
                  <span className="text-xs text-white/70">{n.message}</span>
                  <p className="text-xs text-white/25 mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
