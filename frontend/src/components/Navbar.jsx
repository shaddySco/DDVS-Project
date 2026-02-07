import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import Button from "./ui/Button";

export default function Navbar() {
  const { walletAddress, connectWallet, logout, switchAccount, user } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSwitch = async () => {
    setProfileOpen(false);
    await switchAccount();
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gaming-bg/60 backdrop-blur-xl border-b border-white/5 py-4 transition-all duration-300 supports-[backdrop-filter]:bg-gaming-bg/20">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* BRAND */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-neon-blue to-neon-purple rounded-xl rotate-6 group-hover:rotate-12 transition-transform opacity-80 blur-[2px]"></div>
            <div className="relative w-full h-full bg-black rounded-xl border border-white/10 flex items-center justify-center text-white font-black text-lg z-10">
              ⚡
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter text-white group-hover:text-neon-blue transition-colors leading-none">DDVS<span className="text-neon-purple">.</span></span>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-[0.3em] group-hover:tracking-[0.4em] transition-all">Protocol</span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 backdrop-blur-md">
          {[
            { name: "Nexus", path: "/community", icon: "🌐" },
            { name: "Deploy", path: "/submit", icon: "🚀" },
            { name: "Dashboard", path: "/dashboard", icon: "💠" },
          ].map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${isActive
                  ? "bg-neon-blue text-black shadow-neon-blue"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
                }`
              }
            >
              <span className="text-sm">{link.icon}</span>
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">

          {/* User Level Badge */}
          {walletAddress && user && (
            <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Architect LVL {user.level || 1}</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse"></span>
                <span className="text-xs font-mono text-neon-blue">{user.xp || 0} XP</span>
              </div>
            </div>
          )}

          {walletAddress ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="group relative"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-neon-blue group-hover:shadow-neon-blue">
                  <span className="font-mono text-xs font-bold text-white group-hover:text-neon-blue">
                    {walletAddress.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green border-2 border-black rounded-full"></div>
              </button>

              {/* DROPDOWN MENU */}
              {profileOpen && (
                <div className="absolute right-0 mt-4 w-72 bg-[#0A0F1C] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-2 animate-in fade-in slide-in-from-top-2 z-50 overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

                  <div className="p-4 border-b border-white/5 bg-white/[0.02] mb-2 rounded-t-xl">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Connected Signal</p>
                    <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                      <span className="w-2 h-2 rounded-full bg-neon-green"></span>
                      <p className="font-mono text-xs text-neon-blue truncate">{walletAddress}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                      onClick={() => setProfileOpen(false)}
                    >
                      <span className="p-2 rounded-lg bg-white/5 group-hover:bg-neon-blue/20 text-gray-400 group-hover:text-neon-blue transition-colors">👤</span>
                      Neural Interface
                    </Link>

                    <button
                      onClick={handleSwitch}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group text-left"
                    >
                      <span className="p-2 rounded-lg bg-white/5 group-hover:bg-neon-purple/20 text-gray-400 group-hover:text-neon-purple transition-colors">🔄</span>
                      Switch Frequency
                    </button>

                    <div className="h-px bg-white/5 mx-4 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all group text-left"
                    >
                      <span className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 text-red-500 transition-colors">🔴</span>
                      Terminate Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={connectWallet} className="shadow-neon-blue">
              Connect Wallet
            </Button>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0A0F1C]/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-4">
          {[
            { name: "Network Feed", path: "/community" },
            { name: "Deploy Project", path: "/submit" },
            { name: "Neural Dashboard", path: "/dashboard" },
          ].map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `p-4 rounded-xl font-bold uppercase tracking-widest text-xs border border-transparent ${isActive ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/30' : 'text-gray-400 hover:bg-white/5'}`}
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}