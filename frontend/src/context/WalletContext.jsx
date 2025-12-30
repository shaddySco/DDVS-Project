import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();

    setProvider(provider);
    setAddress(address);
    setNetwork(network);
  }

  function disconnectWallet() {
    setProvider(null);
    setAddress(null);
    setNetwork(null);
  }

  return (
    <WalletContext.Provider
      value={{ address, provider, network, connectWallet, disconnectWallet }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
