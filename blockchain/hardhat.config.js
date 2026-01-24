require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const config = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};

if (process.env.POLYGON_AMOY_RPC_URL && process.env.PRIVATE_KEY) {
  config.networks.amoy = {
    url: process.env.POLYGON_AMOY_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  };
}

module.exports = config;