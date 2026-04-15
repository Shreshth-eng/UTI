import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-16 py-4 flex justify-between items-center transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0f1e]/90 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      {/* Logo */}
      <div>
        <span className="text-3xl font-black bg-linear-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent">
          UTI
        </span>
        <p className="text-xs text-white/40 font-medium">Unified Transport Interface</p>
      </div>

      {/* Nav Links */}
      <nav className="flex items-center gap-8">
        <a href="#features" className="text-white/60 text-sm font-medium hover:text-white transition">Features</a>
        <a href="#vision"   className="text-white/60 text-sm font-medium hover:text-white transition">About</a>
        <a href="#howitworks" className="text-white/60 text-sm font-medium hover:text-white transition">How It Works</a>
        <a href="#contact"  className="text-white/60 text-sm font-medium hover:text-white transition">Contact</a>

        <Link to="/signup">
          <button className="px-5 py-2 rounded-lg border border-blue-500/50 text-blue-400 bg-blue-500/8 text-sm font-semibold hover:bg-blue-500/20 hover:border-blue-400 transition-all">
            Join Us
          </button>
        </Link>

        <Link to="/login">
          <button className="px-5 py-2 rounded-lg bg-linear-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold hover:opacity-85 hover:-translate-y-0.5 transition-all">
            Sign In
          </button>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
