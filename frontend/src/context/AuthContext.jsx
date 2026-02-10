/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers"; 
import axios from "../lib/axios";
import { BLOCKCHAIN_CONFIG } from "../config/blockchain";

const AuthContext = createContext();

// Helper function to create provider with fallback RPC endpoints
const createProvider = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  try {
    // Try with MetaMask's provider first
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.getNetwork(); // Test connection
    return provider;
  } catch (error) {
    console.warn("MetaMask provider failed, trying fallback RPC:", error.message);
    
    // Try fallback RPC endpoints
    for (const rpcUrl of BLOCKCHAIN_CONFIG.BACKUP_RPC_URLS) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        await provider.getNetwork(); // Test connection
        console.log("Connected to fallback RPC:", rpcUrl);
        return new ethers.BrowserProvider(window.ethereum);
      } catch (fallbackError) {
        console.warn(`Fallback RPC ${rpcUrl} failed:`, fallbackError.message);
      }
    }
    
    throw new Error("All RPC endpoints failed. Please check your internet connection.");
  }
};

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
    // Token will be removed from axios interceptor automatically
    console.log("Logged out successfully");
  };


  // 2. Connect Wallet & Login Function
  const connectWallet = async () => {
    try {
      // Force MetaMask to show the account picker UI
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      }

      const provider = await createProvider();
      const signerInstance = await provider.getSigner();
      const address = await signerInstance.getAddress();
      
      setWalletAddress(address);
      setSigner(signerInstance); 

      // Login to backend
      const res = await axios.post("/auth/login", {
        wallet_address: address,
      });

      const { user: userData, token } = res.data;

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      localStorage.setItem("ddvs_token", token);
      // Token will be attached by axios interceptor automatically
      // No need to set axios.defaults.headers.common

      setUser(userData);
      
      // Redirect if profile is incomplete
      if (!userData.username || userData.username === "Anonymous User") {
        window.location.href = "/dashboard?edit=true";
      }

      return userData; 
    } catch (error) {
      console.error("Wallet connection failed", error);
      // Clear any partial state on failure
      setWalletAddress(null);
      setSigner(null);
      setUser(null);
      
      // Provide user-friendly error messages
      if (error.message.includes("RPC endpoint returned too many errors")) {
        throw new Error("Blockchain network is experiencing high traffic. Please try again in a few minutes.");
      } else if (error.message.includes("All RPC endpoints failed")) {
        throw new Error("Unable to connect to blockchain network. Please check your internet connection and try again.");
      } else {
        throw error;
      }
    }
  };


  // 3. Switch Account Function
  const switchAccount = async () => {
    try {
      // Force MetaMask to show the account picker UI
      if (window.ethereum) {
        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [{ eth_accounts: {} }],
        });
      }

      // Clear old session data
      logout();

      // Re-run the connection logic to log in with the NEW account
      await connectWallet();
      
    } catch (error) {
      console.error("Switch account failed", error);
      throw error;
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

      // Token will be attached by axios interceptor automatically
      // No need to set axios.defaults.headers.common

      try {
        const res = await axios.get("/auth/me"); 
        const userData = res.data;
        
        setUser(userData);
        setWalletAddress(userData.wallet_address);
        
        if (window.ethereum) {
          try {
            const provider = await createProvider();
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
              const signerInstance = await provider.getSigner();
              setSigner(signerInstance);
            }
          } catch (providerError) {
            console.warn("Failed to restore provider connection:", providerError.message);
            // Don't fail the whole auth restore if provider fails
          }
        }
      } catch (error) {
        console.error("Auth restore failed", error);
        // Token is invalid or expired - clean up
        logout();
      }
      setLoading(false);
    };

    restoreAuth();
  }, []);

  // 5. Check if user is fully authenticated
  const isAuthenticated = () => {
    const token = localStorage.getItem("ddvs_token");
    return !!token && !!user && !!walletAddress;
  };


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
        loading,
        isAuthenticated
      }}
    >

      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
