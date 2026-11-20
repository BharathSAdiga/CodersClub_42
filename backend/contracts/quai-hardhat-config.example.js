/**
 * Quai Network Orchard (Cyprus-1) Deployment Configuration
 * Hardhat config template using quais / ethers for Quai Network Cyprus-1 Zone
 */
export const quaiConfig = {
  networks: {
    orchardCyprus1: {
      url: "https://orchard.rpc.quai.network/cyprus1",
      chainId: 15000,
      accounts: process.env.QUAI_DEPLOYER_PRIVATE_KEY ? [process.env.QUAI_DEPLOYER_PRIVATE_KEY] : [],
    },
  },
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
