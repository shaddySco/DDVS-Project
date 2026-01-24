import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import Button from "./ui/Button";

export default function Navbar() {
  const { walletAddress, connectWallet, logout, switchAccount, user } = useAuth(); // Assuming 'user' is available for XP/Level
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* BRAND */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center text-white font-bold text-xl shadow-neon-purple group-hover:scale-110 transition-transform">
            ◆
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-wider text-white group-hover:text-neon-blue transition-colors">DDVS</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Decentralized Verify</span>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { name: "Community", path: "/community" },
            { name: "Submit", path: "/submit" },
            { name: "Dashboard", path: "/dashboard" },
          ].map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide transition-all duration-300 relative ${
                  isActive 
                  ? "text-neon-blue neon-text-blue" 
                  : "text-gray-400 hover:text-white"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          
          {/* User Level Badge (Mockup) */}
          {walletAddress && (
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-black/40 rounded-full border border-white/10">
               <span className="text-xs text-neon-gold">LVL {user?.level || 1}</span>
               <div className="w-px h-3 bg-white/10"></div>
               <span className="text-xs text-neon-purple">{user?.xp || 0} XP</span>
             </div>
          )}

          {walletAddress ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 border border-white/20 p-0.5 hover:border-neon-purple transition-all"
              >
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center font-bold text-xs text-neon-blue">
                   {walletAddress.slice(2, 4).toUpperCase()}
                </div>
              </button>

              {/* DROPDOWN MENU */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-white/5 mb-2">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Connected Wallet</p>
                    <p className="font-mono text-xs text-neon-blue truncate">{walletAddress}</p>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    <span>👤</span> My Dashboard
                  </Link>

                  <button 
                    onClick={handleSwitch}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <span>🔄</span> Switch Account
                  </button>

                  <div className="h-px bg-white/5 my-2"></div>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                  >
                    <span>🔴</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button 
            className="md:hidden text-2xl text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE NAV */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0F172A] border-b border-white/10 p-4 flex flex-col gap-4 shadow-2xl">
           <NavLink to="/community" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 py-2 border-b border-white/5">Community</NavLink>
           <NavLink to="/submit" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 py-2 border-b border-white/5">Submit</NavLink>
           <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-gray-300 py-2 border-b border-white/5">Dashboard</NavLink>
        </div>
      )}
    </nav>
  );
}