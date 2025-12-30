import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Connect Wallet
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

      // Send wallet to backend
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/login",
        { wallet_address: address }
      );

      setUser(response.data);
    } catch (error) {
      console.error("Wallet connection failed:", error);
    }
  };

  // 🔹 Fetch user if wallet already connected
  useEffect(() => {
    const checkWallet = async () => {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);

        const response = await axios.get(
          "http://127.0.0.1:8000/api/auth/me",
          {
            headers: {
              "X-Wallet-Address": address,
            },
          }
        );

        setUser(response.data);
      }

      setLoading(false);
    };

    checkWallet();
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
