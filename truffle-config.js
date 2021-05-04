require("babel-register");
require("babel-polyfill");
require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = process.env.ropsten;
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://ropsten.infura.io/v3/55c8ee7f6b4d4b939ffd2d57cfc8af78"
        );
      },
      network_id: "3",
    },
  },
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/abis/",
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      evmVersion: "petersburg",
    },
  },
};
