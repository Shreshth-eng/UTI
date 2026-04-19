import FleetMap from "./FleetMap";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center px-16 pt-24 pb-16 overflow-hidden">

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-2 gap-16 items-center w-full max-w-7xl mx-auto">

        {/* Left Content */}
        <div className="animate-fadeUp">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold mb-8 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            India's #1 Unified Transport Platform
          </div>

          {/* Heading */}
          <h1 className="text-6xl font-black leading-[1.05] mb-6">
            <span className="text-white">One Nation</span>
            <br />
            <span className="bg-linear-to-r from-orange-500 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              One Transport
            </span>
            <br />
            <span className="text-white">Network</span>
          </h1>

          {/* Description */}
          <p className="text-white/55 text-lg leading-relaxed mb-4 max-w-lg">
            UTI unifies India's transport ecosystem by connecting drivers, truck owners,
            senders, and receivers into one intelligent digital platform.
          </p>
          <p className="text-white/40 text-base leading-relaxed mb-10 max-w-lg">
            Eliminate inefficiencies, reduce empty trips, digitize paperwork, and enable
            real-time tracking — transforming how goods move across the nation.
          </p>

          {/* Search Box */}
          <div className="bg-white/4 border border-white/10 rounded-2xl p-5 flex flex-wrap gap-3 backdrop-blur-sm shadow-2xl">
            <select className="flex-1 min-w-[130px] px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white/80 text-sm outline-none focus:border-blue-500/50 transition">
              <option className="bg-[#0a0f1e]">Select Truck Type</option>
              <option className="bg-[#0a0f1e]">Mini Truck</option>
              <option className="bg-[#0a0f1e]">Container</option>
              <option className="bg-[#0a0f1e]">Trailer</option>
            </select>
            <input
              type="text"
              placeholder="Pick up location"
              className="flex-1 min-w-[130px] px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm outline-none focus:border-blue-500/50 transition"
            />
            <input
              type="text"
              placeholder="Drop off location"
              className="flex-1 min-w-[130px] px-4 py-3 bg-white/6 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm outline-none focus:border-blue-500/50 transition"
            />
            <button className="px-7 py-3 bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold text-sm rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all whitespace-nowrap shadow-lg shadow-blue-500/20">
              Search Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-white/40 text-xs">Verified Drivers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-white/40 text-xs">Real-time GPS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-white/40 text-xs">UPI Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span className="text-white/40 text-xs">24/7 Support</span>
            </div>
          </div>
        </div>

        {/* Right — Live Fleet Map */}
        <div className="w-full">
          <FleetMap />
        </div>
      </div>
    </section>
  );
};

export default Hero;
