require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL, // Get from Alchemy or Infura
      accounts: [process.env.PRIVATE_KEY] // Your personal wallet private key
    }
  }
};