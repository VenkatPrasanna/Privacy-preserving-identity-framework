require("@nomiclabs/hardhat-waffle");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.6",
  networks: {
    dev: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        "f95bcf1814086f3fa44230b5ab3e4cab9d7b47758e386aaa75e8e9066b19640c",
      ],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/3df61336949a4489b7a8a0b29dd71d26",
      accounts: [
        "a3ad52699e24109450d90bfd1f79a4b8c9fc709013cf354376be03cf6d9b29ad",
      ],
    },
  },
};
