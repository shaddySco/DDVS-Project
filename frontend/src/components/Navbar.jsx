import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { walletAddress, connectWallet } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "1rem",
        borderBottom: "1px solid #ddd",
      }}
    >
      <div>
        <Link to="/">DDVS</Link>{" "}
        <Link to="/community">Community</Link>{" "}
        <Link to="/submit">Submit</Link>{" "}
        <Link to="/dashboard">Dashboard</Link>
      </div>

      <div>
        {walletAddress ? (
          <span style={{ fontSize: "0.9rem" }}>
            🟢 {walletAddress.slice(0, 6)}...
            {walletAddress.slice(-4)}
          </span>
        ) : (
          <button onClick={connectWallet}>
            🔐 Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}
