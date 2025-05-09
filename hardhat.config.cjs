require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
      viaIR: true,
    },
  },
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_ENDPOINT,
      accounts: [process.env.PLAYER1_PRIVATE_KEY],
    },
    base: {
      url: process.env.ALCHEMY_BASE_ENDPOINT,
      accounts: [process.env.PLAYER1_PRIVATE_KEY],
    },
    arb: {
      url: process.env.ALCHEMY_ARBITRUM_ENDPOINT,
      accounts: [process.env.PLAYER1_PRIVATE_KEY],
    },

    localhost: {
      url: "http://127.0.0.1:8545", // This is the default URL for the Hardhat node
    },
  },
  etherscan: {
    apiKey: "A9ESUJ62PS5A5EVKWEA88RCUHS3I2C7BUB",
  },
  sourcify: {
    enabled: true,
  },
};
