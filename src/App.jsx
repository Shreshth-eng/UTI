import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProjectedRoute'

import Landing  from './pages/Landing'
import Login    from './pages/Login'
import Signup   from './pages/Signup'
import Receiver from "./components/Receiver";
import Sender from "./components/Sender";
import TruckOwner from "./components/TruckOwner";
import Driver from "./components/Driver";


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/receiver"
            element={
              <ProtectedRoute role="receiver">
                <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white text-2xl font-bold">
                  <Route
                    path="/receiver"
                    element={
                      <ProtectedRoute role="receiver">
                        <Receiver />
                      </ProtectedRoute>
                    }
                  />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sender"
            element={
              <ProtectedRoute role="sender">
                <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white text-2xl font-bold">
                  <Route
                    path="/sender"
                    element={
                      <ProtectedRoute role="sender">
                        <Sender />
                      </ProtectedRoute>
                    }
                  />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/truck-owner"
            element={
              <ProtectedRoute role="truckOwner">
                <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white text-2xl font-bold">
                  <Route
                    path="/truck-owner"
                    element={
                      <ProtectedRoute role="truckOwner">
                        <TruckOwner />
                      </ProtectedRoute>
                    }
                  />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/driver"
            element={
              <ProtectedRoute role="driver">
                <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white text-2xl font-bold">
                  <Route
                    path="/driver"
                    element={
                      <ProtectedRoute role="driver">
                        <Driver />
                      </ProtectedRoute>
                    }
                  />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};






// import { useState } from "react";
// import Receiver from "./components/Receiver";
// import Sender from "./components/Sender";
// import TruckOwner from "./components/TruckOwner";
// import Driver from "./components/Driver";

// const roles = [
//   {
//     id: "receiver",
//     label: "Receiver",
//     icon: "📦",
//     sub: "Request & track goods",
//     glowClass: "bg-blue-600/10",
//     border: "rgba(59,130,246,0.20)",
//     activeBorder: "rgba(59,130,246,0.50)",
//     badge: "bg-blue-500/15 text-blue-300 border-blue-500/25",
//   },
//   {
//     id: "sender",
//     label: "Sender",
//     icon: "🏭",
//     sub: "Create & manage shipments",
//     glowClass: "bg-orange-500/10",
//     border: "rgba(249,115,22,0.20)",
//     activeBorder: "rgba(249,115,22,0.50)",
//     badge: "bg-orange-500/15 text-orange-300 border-orange-500/25",
//   },
//   {
//     id: "truckowner",
//     label: "Truck Owner",
//     icon: "🚛",
//     sub: "Manage fleet & requests",
//     glowClass: "bg-green-500/10",
//     border: "rgba(34,197,94,0.20)",
//     activeBorder: "rgba(34,197,94,0.50)",
//     badge: "bg-green-500/15 text-green-300 border-green-500/25",
//   },
//   {
//     id: "driver",
//     label: "Driver",
//     icon: "✈️",
//     sub: "View trips & update status",
//     glowClass: "bg-purple-500/10",
//     border: "rgba(168,85,247,0.20)",
//     activeBorder: "rgba(168,85,247,0.50)",
//     badge: "bg-purple-500/15 text-purple-300 border-purple-500/25",
//   },
// ];

// function RoleSelector({ onSelect }) {
//   const [hovered, setHovered] = useState(null);

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
//       style={{ background: "#0a0f1e" }}
//     >
//       <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px] pointer-events-none" />
//       <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/6 rounded-full blur-[120px] pointer-events-none" />

//       <div className="relative z-10 text-center w-full max-w-2xl">
//         <p
//           className="text-5xl font-black mb-2"
//           style={{
//             background: "linear-gradient(135deg, #60a5fa, #fb923c)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//           }}
//         >
//           UTI
//         </p>
//         <p className="text-white/40 text-sm mb-1">
//           Unified Transport Interface
//         </p>
//         <p className="text-white/20 text-xs mb-12 uppercase tracking-widest">
//           Select your role to continue
//         </p>

//         <div className="grid grid-cols-2 gap-4 mb-8">
//           {roles.map((role) => (
//             <button
//               key={role.id}
//               onClick={() => onSelect(role.id)}
//               onMouseEnter={() => setHovered(role.id)}
//               onMouseLeave={() => setHovered(null)}
//               className="relative p-6 text-left rounded-2xl overflow-hidden transition-all duration-300"
//               style={{
//                 background:
//                   hovered === role.id
//                     ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))"
//                     : "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
//                 border: `1px solid ${hovered === role.id ? role.activeBorder : role.border}`,
//                 backdropFilter: "blur(20px)",
//                 transform:
//                   hovered === role.id ? "translateY(-2px)" : "translateY(0)",
//               }}
//             >
//               <div
//                 className={`absolute top-0 right-0 w-32 h-32 ${role.glowClass} rounded-full blur-[60px] pointer-events-none`}
//               />
//               <div className="relative z-10">
//                 <div className="text-4xl mb-4">{role.icon}</div>
//                 <p className="text-base font-black text-white mb-1">
//                   {role.label}
//                 </p>
//                 <p className="text-xs text-white/35 mb-3">{role.sub}</p>
//                 <span
//                   className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${role.badge}`}
//                 >
//                   Open Dashboard →
//                 </span>
//               </div>
//             </button>
//           ))}
//         </div>
//         <p className="text-white/15 text-xs">
//           Demo mode — mock data · Phase 3 of UTI Platform
//         </p>
//       </div>
//     </div>
//   );
// }

// export default function App() {
//   const [role, setRole] = useState(null);
//   if (!role) return <RoleSelector onSelect={setRole} />;
//   return (
//     <div>
//       <button
//         onClick={() => setRole(null)}
//         className="fixed top-4 right-4 z-50 text-xs font-semibold text-white/50 hover:text-white px-3 py-1.5 rounded-lg transition-all hover:bg-white/10"
//         style={{
//           background: "rgba(255,255,255,0.05)",
//           border: "1px solid rgba(255,255,255,0.10)",
//           backdropFilter: "blur(10px)",
//         }}
//       >
//         ← Switch Role
//       </button>
//       {role === "receiver" && <Receiver />}
//       {role === "sender" && <Sender />}
//       {role === "truckowner" && <TruckOwner />}
//       {role === "driver" && <Driver />}
//     </div>
//   );
// }