import { useEffect, useRef, useState } from 'react';

const cities = [
  { name: 'Mumbai',    x: 0.12, y: 0.62, major: true  },
  { name: 'Delhi',     x: 0.35, y: 0.18, major: true  },
  { name: 'Bangalore', x: 0.28, y: 0.80, major: true  },
  { name: 'Chennai',   x: 0.38, y: 0.82, major: true  },
  { name: 'Kolkata',   x: 0.72, y: 0.38, major: true  },
  { name: 'Hyderabad', x: 0.34, y: 0.65, major: false },
  { name: 'Pune',      x: 0.16, y: 0.68, major: false },
  { name: 'Ahmedabad', x: 0.16, y: 0.42, major: false },
  { name: 'Jaipur',    x: 0.28, y: 0.28, major: false },
  { name: 'Lucknow',   x: 0.48, y: 0.28, major: false },
  { name: 'Nagpur',    x: 0.38, y: 0.54, major: false },
  { name: 'Surat',     x: 0.17, y: 0.52, major: false },
];

const routes = [
  [0,1],[0,2],[0,3],[1,4],[1,7],[1,8],[2,3],[2,5],
  [1,9],[3,4],[5,3],[6,0],[7,0],[8,1],[9,4],[10,1],[10,5],[11,0],
];

class Truck {
  constructor(routeIdx) {
    this.routeIdx = routeIdx % routes.length;
    const r = routes[this.routeIdx];
    this.from  = cities[r[0]];
    this.to    = cities[r[1]];
    this.t     = Math.random();
    this.speed = 0.003 + Math.random() * 0.004;
    this.color = Math.random() > 0.5 ? 'blue' : 'orange';
    this.trail = [];
    this.x     = this.from.x;
    this.y     = this.from.y;
  }

  update() {
    this.t += this.speed;
    if (this.t >= 1) {
      this.t     = 0;
      this.trail = [];
      const candidates = routes.filter(r => cities[r[0]] === this.to);
      if (candidates.length > 0) {
        const next  = candidates[Math.floor(Math.random() * candidates.length)];
        this.from   = this.to;
        this.to     = cities[next[1]];
      } else {
        this.routeIdx = (this.routeIdx + 1) % routes.length;
        const r       = routes[this.routeIdx];
        this.from     = cities[r[0]];
        this.to       = cities[r[1]];
      }
    }
    this.x = this.from.x + (this.to.x - this.from.x) * this.t;
    this.y = this.from.y + (this.to.y - this.from.y) * this.t;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 18) this.trail.shift();
  }

  draw(ctx, W, H) {
    const isBlue = this.color === 'blue';

    // Trail
    if (this.trail.length > 1) {
      for (let i = 1; i < this.trail.length; i++) {
        const alpha = (i / this.trail.length) * 0.5;
        ctx.beginPath();
        ctx.moveTo(this.trail[i - 1].x * W, this.trail[i - 1].y * H);
        ctx.lineTo(this.trail[i].x * W,     this.trail[i].y * H);
        ctx.strokeStyle = isBlue
          ? `rgba(59,130,246,${alpha})`
          : `rgba(234,88,12,${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Glow ring
    ctx.beginPath();
    ctx.arc(this.x * W, this.y * H, 7, 0, Math.PI * 2);
    ctx.fillStyle = isBlue
      ? 'rgba(59,130,246,0.25)'
      : 'rgba(234,88,12,0.25)';
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(this.x * W, this.y * H, 4, 0, Math.PI * 2);
    ctx.fillStyle = isBlue ? '#3b82f6' : '#ea580c';
    ctx.fill();
  }
}

const FleetMap = () => {
  const canvasRef   = useRef(null);
  const trucksRef   = useRef([]);
  const pulseRef    = useRef(0);
  const frameRef    = useRef(null);
  const [count, setCount]  = useState(2847);
  const [deliv, setDeliv]  = useState(12483);

  useEffect(() => {
    trucksRef.current = Array.from({ length: 18 }, (_, i) => new Truck(i));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const drawGrid = (W, H) => {
      ctx.strokeStyle = 'rgba(255,255,255,0.025)';
      ctx.lineWidth   = 0.5;
      for (let x = 0; x < W; x += W / 8) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += H / 6) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    };

    const drawRoutes = (W, H) => {
      routes.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(cities[a].x * W, cities[a].y * H);
        ctx.lineTo(cities[b].x * W, cities[b].y * H);
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth   = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      });
    };

    const drawCities = (W, H, pulse) => {
      cities.forEach(c => {
        const cx = c.x * W;
        const cy = c.y * H;
        const r  = c.major ? 6 : 4;

        ctx.beginPath();
        ctx.arc(cx, cy, r + Math.sin(pulse * 0.05) * (c.major ? 1.5 : 0.8), 0, Math.PI * 2);
        ctx.fillStyle = c.major ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = c.major ? '#3b82f6' : 'rgba(255,255,255,0.4)';
        ctx.fill();

        if (c.major) {
          ctx.font      = '500 10px Inter';
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.textAlign = 'center';
          ctx.fillText(c.name, cx, cy - r - 5);
        }
      });
    };

    const animate = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      drawGrid(W, H);
      drawRoutes(W, H);
      trucksRef.current.forEach(t => { t.update(); t.draw(ctx, W, H); });
      drawCities(W, H, pulseRef.current);
      pulseRef.current++;

      if (pulseRef.current % 90 === 0) {
        setCount(c => c + Math.floor(Math.random() * 3));
        setDeliv(d => d + Math.floor(Math.random() * 5 + 1));
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="relative bg-[#0d1528] rounded-3xl p-5 overflow-hidden border border-white/10">

      {/* Glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className="text-white/60 text-xs font-bold tracking-widest uppercase">Live Fleet Dashboard</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/25 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          {/* <span className="text-green-400 text-xs font-bold">LIVE</span> */}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-xl"
        style={{ height: '260px' }}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3 mt-4 relative z-10">
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-1">Active Trucks</p>
          <p className="text-white text-xl font-black">{count.toLocaleString()}</p>
          <p className="text-green-400 text-xs font-semibold mt-0.5">↑ 12% today</p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-1">Deliveries</p>
          <p className="text-white text-xl font-black">{deliv.toLocaleString()}</p>
          <p className="text-green-400 text-xs font-semibold mt-0.5">↑ 18% vs yesterday</p>
        </div>
        <div className="bg-white/4 border border-white/8 rounded-xl p-3">
          <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-1">Avg. Time</p>
          <p className="text-white text-xl font-black">4.2h</p>
          <p className="text-green-400 text-xs font-semibold mt-0.5">↓ 8% faster</p>
        </div>
      </div>
    </div>
  );
};

export default FleetMap;
