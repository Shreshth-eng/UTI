const features = [
  { icon: '🔍', title: 'Smart Load Matching',  desc: 'AI-powered matching connects senders with the right drivers instantly.' },
  { icon: '🗺️', title: 'Optimized Routing',    desc: 'Minimize fuel costs and delivery times with intelligent route planning.' },
  { icon: '📍', title: 'Real-Time Tracking',   desc: 'Monitor shipment progress with live GPS location updates.' },
  { icon: '💰', title: 'Price Estimation',     desc: 'Transparent cost calculation based on distance and load type.' },
  { icon: '🎙️', title: 'Voice Assistance',     desc: 'Multilingual support for easy communication between stakeholders.' },
  { icon: '💳', title: 'Digital Payments',     desc: 'Secure UPI-based transactions with automated record-keeping.' },
  { icon: '🪪', title: 'Driver Verification',  desc: 'Integrated KYC ensures safety and accountability.' },
  { icon: '👥', title: 'Role-Based Access',    desc: 'Secure portals tailored for Drivers, Owners, Senders, Receivers.' },
];

const Features = () => {
  return (
    <section id="features" className="px-16 pb-24">

      {/* Section Header */}
      <div className="text-center mb-14">
        <p className="text-blue-400 text-xs font-bold tracking-[3px] uppercase mb-3">Platform Features</p>
        <h2 className="text-4xl font-black text-white mb-4">Everything in one platform</h2>
        <p className="text-white/40 text-base max-w-xl mx-auto">
          Built for India's logistics ecosystem — every feature designed to eliminate inefficiency.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-4 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="group bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-blue-900/15 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 cursor-default"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600/20 to-orange-500/10 border border-white/10 flex items-center justify-center text-xl mb-4 group-hover:border-blue-500/30 transition">
              {f.icon}
            </div>
            <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
            <p className="text-xs text-white/40 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
