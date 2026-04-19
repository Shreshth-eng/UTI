import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, saveAuth, getDashboardRoute } from "../utils/api";

const roles = [
  {
    value: "sender",
    label: "Sender",
    icon: "🏭",
    desc: "I send goods / factory",
  },
  {
    value: "truck_owner",
    label: "Truck Owner",
    icon: "🚚",
    desc: "I own trucks / fleet",
  },
  {
    value: "driver",
    label: "Driver",
    icon: "🧑‍✈️",
    desc: "I drive and deliver goods",
  },
  {
    value: "receiver",
    label: "Receiver",
    icon: "📦",
    desc: "I need goods delivered",
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    setError("");
    if (!form.role) {
      setError("Please select your role");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Signup failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const routes = {
        receiver: "/receiver",
        sender: "/sender",
        truck_owner: "/truck-owner",
        driver: "/driver",
      };
      navigate(routes[data.user.role] || "/");
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/">
            <p className="text-4xl font-black bg-linear-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-1">
              UTI
            </p>
          </Link>
          <p className="text-white/40 text-sm">Unified Transport Interface</p>
        </div>

        <div className="bg-white/4 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? "bg-blue-600 text-white" : "bg-white/10 text-white/30"}`}
                >
                  {s}
                </div>
                <div
                  className={`text-xs font-semibold transition-all ${step >= s ? "text-white/70" : "text-white/25"}`}
                >
                  {s === 1 ? "Choose role" : "Your details"}
                </div>
                {s < 2 && (
                  <div
                    className={`h-px flex-1 transition-all ${step > s ? "bg-blue-600" : "bg-white/10"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-white mb-1">
                Who are you?
              </h2>
              <p className="text-white/40 text-sm mb-6">
                Select your role to get started
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      form.role === r.value
                        ? "bg-blue-600/15 border-blue-500/50"
                        : "bg-white/3 border-white/8 hover:bg-white/6 hover:border-white/15"
                    }`}
                  >
                    <span className="text-2xl block mb-2">{r.icon}</span>
                    <p className="text-white text-sm font-bold">{r.label}</p>
                    <p className="text-white/40 text-xs mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full py-3.5 bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold text-sm rounded-xl hover:opacity-90 transition"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black text-white">
                  Create account
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600/15 border border-blue-500/30 text-blue-400">
                  {roles.find((r) => r.value === form.role)?.label}
                </span>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Rajesh Kumar"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-blue-500/50 transition"
                  />
                </div>

                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-blue-500/50 transition"
                  />
                </div>

                <div>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-blue-500/50 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-blue-500/50 transition"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">
                      Confirm
                    </label>
                    <input
                      type="password"
                      name="confirm"
                      value={form.confirm}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-blue-500/50 transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError("");
                    }}
                    className="px-6 py-3.5 border border-white/15 text-white/60 font-bold text-sm rounded-xl hover:bg-white/5 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold text-sm rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </div>
              </div>
            </form>
          )}

          <p className="text-center text-white/35 text-sm mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-400 font-semibold hover:text-blue-300 transition"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 Unified Transport Interface
        </p>
      </div>
    </div>
  );
}
