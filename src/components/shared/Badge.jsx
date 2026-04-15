export default function Badge({ status }) {
  const styles = {
    "In Transit": "bg-blue-500/15 text-blue-300 border-blue-500/25",
    Delivered: "bg-green-500/15 text-green-300 border-green-500/25",
    Completed: "bg-green-500/15 text-green-300 border-green-500/25",
    Pending: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    Available: "bg-green-500/15 text-green-300 border-green-500/25",
    "On Trip": "bg-blue-500/15 text-blue-300 border-blue-500/25",
    Maintenance: "bg-red-500/15 text-red-300 border-red-500/25",
    Active: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  };
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-full font-semibold border backdrop-blur-sm ${styles[status] || "bg-white/10 text-white/60 border-white/10"}`}
    >
      {status}
    </span>
  );
}
