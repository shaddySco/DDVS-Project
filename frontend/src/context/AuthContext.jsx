import { createContext, useContext, useState, useEffect } from "react";
import axios from "../lib/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Connect Wallet & Login
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const address = accounts[0];
      setWalletAddress(address);

      // 🔐 Login to backend
   const res = await axios.post("/api/auth/login", {
  wallet_address: address,
});


      const { user, token } = res.data;

      // 🔑 Persist token
      localStorage.setItem("ddvs_token", token);

      // 🔑 Attach token globally
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  // 🔹 Restore auth on refresh
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem("ddvs_token");

      if (!token) {
        setLoading(false);
        return;
      }

      // 🔑 Re-attach token
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data);
        setWalletAddress(res.data.wallet_address);
      } catch (error) {
        console.error("Auth restore failed", error);
        localStorage.removeItem("ddvs_token");
        setUser(null);
      }

      setLoading(false);
    };

    restoreAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ walletAddress, user, connectWallet, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
