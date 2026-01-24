/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers"; 
import axios from "../lib/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [signer, setSigner] = useState(null); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Logout Function
  const logout = () => {
    setWalletAddress(null);
    setSigner(null);
    setUser(null);
    localStorage.removeItem("ddvs_token");
    delete axios.defaults.headers.common["Authorization"];
    console.log("Logged out successfully");
  };

  // 2. Connect Wallet & Login Function
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    try {
      // Force MetaMask to show the account picker UI
      // This ensures that when a user logs out and reconnects, they can choose a different account
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signerInstance = await provider.getSigner();
      const address = await signerInstance.getAddress();
      
      setWalletAddress(address);
      setSigner(signerInstance); 

      // Login to backend
      const res = await axios.post("/auth/login", {
        wallet_address: address,
      });

      const { user: userData, token } = res.data;

      localStorage.setItem("ddvs_token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(userData);
      
      // Redirect if profile is incomplete
      if (!userData.username || userData.username === "Anonymous User") {
        window.location.href = "/dashboard?edit=true";
      }

      return userData; 
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  // 3. Switch Account Function
  const switchAccount = async () => {
    if (!window.ethereum) {
      alert("MetaMask not detected");
      return;
    }

    try {
      // Force MetaMask to show the account picker UI
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });

      // Clear old session data
      logout();

      // Re-run the connection logic to log in with the NEW account
      await connectWallet();
      
    } catch (error) {
      console.error("Switch account failed", error);
    }
  };

  // 4. Restore Session on Refresh
  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem("ddvs_token");

      if (!token) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const res = await axios.get("/auth/me"); 
        setUser(res.data);
        setWalletAddress(res.data.wallet_address);
        
        if (window.ethereum) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                const signerInstance = await provider.getSigner();
                setSigner(signerInstance);
            }
        }
      } catch (error) {
        console.error("Auth restore failed", error);
        logout(); // Clean up if token is invalid
      }
      setLoading(false);
    };

    restoreAuth();
  }, []);

  return (
    <AuthContext.Provider
      // 🔹 Export ALL functions here so Navbar and Dashboard can use them
      value={{ 
        walletAddress, 
        signer, 
        user, 
        setUser, 
        connectWallet, 
        logout, 
        switchAccount, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}