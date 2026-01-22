import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  // 1. Pull all necessary functions from AuthContext
  const { walletAddress, connectWallet, logout, switchAccount } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ---------- Dark Mode Logic ---------- */
  useEffect(() => {
    const stored = localStorage.getItem("ddvs-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("ddvs-theme", isDark ? "dark" : "light");
  };

  /* ---------- Account Handlers ---------- */
  const handleSwitch = async () => {
    setProfileOpen(false);
    await switchAccount();
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  /* ---------- Close dropdown on outside click ---------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <style>
        {`
        :root {
          --bg: #ffffff;
          --text: #111827;
          --muted: #6b7280;
          --border: #e5e7eb;
          --primary: #2563eb;
          --hover: #f9fafb;
        }

        .dark {
          --bg: #0f172a;
          --text: #f3f4f6;
          --muted: #9ca3af;
          --border: #1e293b;
          --primary: #60a5fa;
          --hover: #1e293b;
        }

        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .logo {
          color: var(--primary);
          font-weight: bold;
          font-size: 1.2rem;
        }

        .brand-text {
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.025em;
        }

        .links {
          display: flex;
          gap: 1.5rem;
        }

        .links a {
          text-decoration: none;
          color: var(--muted);
          font-weight: 500;
          transition: color 0.2s;
        }

        .links a.active {
          color: var(--primary);
        }

        .links a:hover {
          color: var(--text);
        }

        .actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          padding: 5px;
          display: grid;
          place-items: center;
        }

        .connect-btn {
          background: var(--primary);
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: opacity 0.2s;
        }

        .connect-btn:hover {
          opacity: 0.9;
        }

        .profile-trigger {
          position: relative;
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--primary);
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 0.75rem;
          font-weight: bold;
          cursor: pointer;
          border: 2px solid var(--border);
        }

        .dropdown-menu {
          position: absolute;
          right: 0;
          top: 48px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          width: 210px;
          padding: 0.5rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .dropdown-info {
          padding: 0.5rem 0.75rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 0.5rem;
        }

        .wallet-addr {
          font-size: 0.75rem;
          color: var(--muted);
          font-family: monospace;
        }

        .dropdown-menu a,
        .dropdown-menu button {
          width: 100%;
          text-align: left;
          padding: 0.6rem 0.75rem;
          background: none;
          border: none;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }

        .dropdown-menu a:hover,
        .dropdown-menu button:hover {
          background: var(--hover);
        }

        .btn-switch {
          color: var(--primary) !important;
          font-weight: 500;
        }

        .btn-logout {
          color: #ef4444 !important;
          margin-top: 4px;
        }

        .hamburger {
          display: none;
          font-size: 1.5rem;
          background: none;
          border: none;
          color: var(--text);
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .hamburger { display: block; }
          .links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0; right: 0;
            background: var(--bg);
            flex-direction: column;
            padding: 1rem;
            border-bottom: 1px solid var(--border);
          }
          .links.open { display: flex; }
        }
        `}
      </style>

      <nav className="nav">
        <Link to="/" className="brand">
          <span className="logo">◆</span>
          <span className="brand-text">DDVS</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <div className={`links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/community" onClick={() => setMenuOpen(false)}>Community</NavLink>
          <NavLink to="/submit" onClick={() => setMenuOpen(false)}>Submit</NavLink>
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
        </div>

        <div className="actions">
          <button className="icon-btn" onClick={toggleDarkMode}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          {walletAddress ? (
            <div className="profile-trigger" ref={dropdownRef}>
              <div className="avatar" onClick={() => setProfileOpen(!profileOpen)}>
                {walletAddress.slice(2, 4).toUpperCase()}
              </div>

              {profileOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-info">
                    <div style={{fontWeight: 600, fontSize: '0.85rem'}}>Connected Wallet</div>
                    <div className="wallet-addr">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  </div>
                  
                  <Link to="/dashboard" onClick={() => setProfileOpen(false)}>
                    👤 My Dashboard
                  </Link>
                  
                  <button className="btn-switch" onClick={handleSwitch}>
                    🔄 Switch Account
                  </button>
                  
                  <button className="btn-logout" onClick={handleLogout}>
                    🔴 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </>
  );
}