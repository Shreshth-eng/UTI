export default function TrackingTimeline({ steps }) {
  const cfg = {
    done: {
      dot: "bg-green-500 shadow-lg shadow-green-500/40",
      line: "bg-green-500/20",
      label: "text-white",
      sub: "text-white/40",
    },
    active: {
      dot: "bg-orange-500 shadow-lg shadow-orange-500/40 ring-4 ring-orange-500/15",
      line: "bg-white/5",
      label: "text-white font-bold",
      sub: "text-orange-400",
    },
    pending: {
      dot: "bg-white/10 border border-white/10",
      line: "bg-white/5",
      label: "text-white/25",
      sub: "text-white/15",
    },
  };

  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const s = cfg[step.status] || cfg.pending;
        return (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-3 h-3 rounded-full shrink-0 mt-1 ${s.dot}`}
              />
              {i < steps.length - 1 && (
                <div className={`w-px flex-1 my-1.5 ${s.line}`} />
              )}
            </div>
            <div className="pb-5">
              <p className={`text-sm ${s.label}`}>{step.label}</p>
              <p className={`text-xs mt-0.5 ${s.sub}`}>{step.sub}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
