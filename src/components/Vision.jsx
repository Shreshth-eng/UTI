const tags = [
  'Auto Load Matching', 'GPS Tracking', 'Digital Documents',
  'Transparent Pricing', 'Driver KYC', 'UPI Payments',
  'Multilingual', 'Role Based Access',
];

const Vision = () => {
  return (
    <section id="vision" className="px-16 pb-24">
      <div className="bg-gradient-to-br from-blue-600/10 via-transparent to-orange-500/8 border border-white/10 rounded-3xl p-16 grid grid-cols-2 gap-16 items-center">

        {/* Left */}
        <div>
          <p className="text-blue-400 text-xs font-bold tracking-[3px] uppercase mb-4">Our Vision</p>
          <h2 className="text-4xl font-black text-white mb-6 leading-tight">
            UPI did it for payments.
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              UTI will do it for transport.
            </span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed mb-4">
            To build India's national digital infrastructure for road transportation — just like UPI
            unified payments, UTI will unify logistics.
          </p>
          <p className="text-white/40 text-base leading-relaxed">
            A fully connected, intelligent logistics ecosystem that improves efficiency,
            increases driver income, reduces fuel waste, and strengthens India's economy.
          </p>
        </div>

        {/* Right — Tags */}
        <div>
          <p className="text-white/30 text-sm mb-6">Platform capabilities</p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/10 border border-blue-500/25 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400/50 transition cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* India badge */}
          <div className="mt-10 flex items-center gap-4 p-5 bg-white/3 border border-white/8 rounded-2xl">
            <div className="text-4xl">🇮🇳</div>
            <div>
              <p className="text-white font-bold text-sm">Built for Bharat</p>
              <p className="text-white/40 text-xs mt-1">
                Designed specifically for India's road transport ecosystem
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Vision;
