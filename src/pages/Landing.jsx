import Navbar      from '../components/Navbar';
import Hero        from '../components/Hero';
import Stats       from '../components/Stats';
import Features    from '../components/Features';
import HowItWorks  from '../components/HowItWorks';
import Vision      from '../components/Vision';
import CTA         from '../components/CTA';
import Footer      from '../components/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Vision />
      <CTA />
      <Footer />
    </div>
  );
};

export default Landing;
