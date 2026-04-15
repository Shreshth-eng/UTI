import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, saveAuth, getDashboardRoute } from "../utils/api";
export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

   const handleSubmit = async (e) => {
     e.preventDefault();
     setError("");
     setLoading(true);

     try {
       const data = await loginUser(form.email, form.password);

       if (data.token) {
         saveAuth(data.token, data.user);
         // Redirect to role-based dashboard
         navigate(getDashboardRoute(data.user.role));
       } else {
         setError(data.message || "Login failed");
       }
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
            <p className="text-4xl font-black bg-linear-to-r from-blue-400 to-orange-400 bg-clip-text text-transparent mb-1">UTI</p>
          </Link>
          <p className="text-white/40 text-sm">Unified Transport Interface</p>
        </div>

        <div className="bg-white/4 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-black text-white mb-1">Welcome back</h2>
          <p className="text-white/40 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-2">Email</label>
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
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Password</label>
                <a href="#" className="text-blue-400 text-xs hover:text-blue-300 transition">Forgot password?</a>
              </div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/25 text-sm outline-none focus:border-blue-500/50 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-linear-to-r from-blue-600 to-blue-500 text-white font-bold text-sm rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/35 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-400 font-semibold hover:text-blue-300 transition">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © 2026 Unified Transport Interface
        </p>
      </div>
    </div>
  )
}
