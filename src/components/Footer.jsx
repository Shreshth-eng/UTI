import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer id="contact" className="bg-black/40 border-t border-white/8 px-16 pt-16 pb-8">

      <div className="grid grid-cols-4 gap-12 mb-12">

        {/* Brand */}
        <div className="col-span-1">
          <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent block mb-3">
            UTI
          </span>
          <p className="text-white/35 text-sm leading-relaxed mb-6">
            India's unified digital infrastructure for road logistics, connecting all stakeholders
            on one intelligent platform.
          </p>
          <div className="flex gap-3">
            {['in', 'tw', 'fb', 'ig'].map((s) => (
              <a
                key={s}
                href="#"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 text-xs font-bold hover:bg-white/10 hover:text-white transition"
              >
                {s.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white/60 text-xs font-bold tracking-[2px] uppercase mb-5">Quick Links</h4>
          <div className="flex flex-col gap-3">
            {['Home', 'Features', 'About Us', 'Blog', 'Careers'].map((l) => (
              <a key={l} href="#" className="text-white/35 text-sm hover:text-white transition">{l}</a>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div>
          <h4 className="text-white/60 text-xs font-bold tracking-[2px] uppercase mb-5">Platform</h4>
          <div className="flex flex-col gap-3">
            {['For Receivers', 'For Senders', 'For Truck Owners', 'For Drivers', 'API Docs'].map((l) => (
              <a key={l} href="#" className="text-white/35 text-sm hover:text-white transition">{l}</a>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white/60 text-xs font-bold tracking-[2px] uppercase mb-5">Contact</h4>
          <div className="flex flex-col gap-3 text-sm text-white/35">
            <a href="mailto:info@uti.com" className="hover:text-white transition">info@uti.com</a>
            <a href="tel:+919876543210" className="hover:text-white transition">+91 98765 43210</a>
            <p className="leading-relaxed">123 Transport Plaza,<br />Mumbai, India 400001</p>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-white/6 pt-6 flex justify-between items-center">
        <p className="text-white/25 text-xs">© 2026 Unified Transport Interface. All rights reserved.</p>
        <p className="text-white/25 text-xs">Built for Bharat 🇮🇳</p>
      </div>

    </footer>
  );
};

export default Footer;
