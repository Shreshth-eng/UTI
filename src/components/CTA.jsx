import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="px-16 pb-24">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/20 to-orange-500/10 border border-white/10 p-20 text-center">

        {/* Background blur orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10">
          <p className="text-blue-400 text-xs font-bold tracking-[3px] uppercase mb-4">Get Started Today</p>
          <h2 className="text-5xl font-black text-white mb-6 leading-tight">
            Ready to Transform
            <br />
            <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
              India's Logistics?
            </span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
            Join thousands of drivers, truck owners, senders, and receivers already using UTI
            to move goods smarter across India.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <button className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-blue-500/25">
                Get Started Free
              </button>
            </Link>
            <button className="px-10 py-4 border border-white/20 text-white/80 font-bold text-base rounded-xl hover:bg-white/5 hover:border-white/40 hover:-translate-y-0.5 transition-all">
              Watch Demo
            </button>
          </div>

          <p className="text-white/25 text-sm mt-6">No credit card required · Free to join</p>
        </div>
      </div>
    </section>
  );
};

export default CTA;
