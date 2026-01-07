import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const { walletAddress, connectWallet, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ---------- Dark Mode ---------- */
  useEffect(() => {
    const stored = localStorage.getItem("ddvs-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("ddvs-theme", isDark ? "dark" : "light");
  };

  /* ---------- Close profile dropdown ---------- */
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
      {/* ---------- STYLES (INLINE, SINGLE FILE) ---------- */}
      <style>
        {`
        :root {
          --bg: #ffffff;
          --text: #111827;
          --muted: #6b7280;
          --border: #e5e7eb;
          --primary: #2563eb;
        }

        .dark {
          --bg: #0f172a;
          --text: #e5e7eb;
          --muted: #9ca3af;
          --border: #1f2937;
          --primary: #60a5fa;
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
        }

        .logo {
          color: var(--primary);
          font-weight: bold;
        }

        .brand-text {
          text-decoration: none;
          font-weight: 600;
          color: var(--text);
        }

        .links {
          display: flex;
          gap: 1.5rem;
        }

        .links a {
          text-decoration: none;
          color: var(--muted);
          font-weight: 500;
        }

        .links a.active {
          color: var(--primary);
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
          font-size: 1rem;
        }

        .connect {
          background: var(--primary);
          color: #fff;
          border: none;
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          cursor: pointer;
        }

        .profile {
          position: relative;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary);
          color: #fff;
          display: grid;
          place-items: center;
          font-size: 0.8rem;
          cursor: pointer;
        }

        .dropdown {
          position: absolute;
          right: 0;
          top: 42px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          width: 180px;
          padding: 0.5rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .dropdown a,
        .dropdown button {
          width: 100%;
          text-align: left;
          padding: 0.45rem 0.6rem;
          background: none;
          border: none;
          color: var(--text);
          font-size: 0.85rem;
          cursor: pointer;
        }

        .logout {
          color: #ef4444;
        }

        .wallet {
          font-size: 0.75rem;
          color: var(--muted);
          padding: 0.4rem 0.6rem;
        }

        .hamburger {
          display: none;
          font-size: 1.4rem;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text);
        }

        /* ---------- RESPONSIVE ---------- */

        @media (max-width: 700px) {
          .hamburger {
            display: block;
          }

          .links {
            position: absolute;
            top: 64px;
            left: 0;
            right: 0;
            background: var(--bg);
            border-bottom: 1px solid var(--border);
            flex-direction: column;
            padding: 1rem;
            display: none;
            gap: 0.75rem;
          }

          .links.open {
            display: flex;
          }
        }
        `}
      </style>

      {/* ---------- NAVBAR ---------- */}
      <nav className="nav">
        <div className="brand">
          <span className="logo">◆</span>
          <Link to="/" className="brand-text">DDVS</Link>
        </div>

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
            <div className="profile" ref={dropdownRef}>
              <div className="avatar" onClick={() => setProfileOpen(!profileOpen)}>
                {walletAddress.slice(2, 4).toUpperCase()}
              </div>

              {profileOpen && (
                <div className="dropdown">
                  <div className="wallet">
                    {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
                  </div>
                  <Link to="/dashboard">Dashboard</Link>
                  <button className="logout" onClick={logout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <button className="connect" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
