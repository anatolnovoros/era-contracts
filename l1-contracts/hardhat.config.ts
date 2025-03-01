import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-solpp";
import "@nomiclabs/hardhat-waffle";
import "hardhat-contract-sizer";
import "hardhat-gas-reporter";
import "hardhat-typechain";
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import "solidity-coverage";
import { getNumberFromEnv } from "./scripts/utils";
import "hardhat-diamond-abi";

// If no network is specified, use the default config
if (!process.env.CHAIN_ETH_NETWORK) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("dotenv").config();
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const systemParams = require("../SystemConfig.json");

const PRIORITY_TX_MAX_GAS_LIMIT = getNumberFromEnv("CONTRACTS_PRIORITY_TX_MAX_GAS_LIMIT");
const DEPLOY_L2_BRIDGE_COUNTERPART_GAS_LIMIT = getNumberFromEnv("CONTRACTS_DEPLOY_L2_BRIDGE_COUNTERPART_GAS_LIMIT");

const prodConfig = {
  UPGRADE_NOTICE_PERIOD: 0,
  // PRIORITY_EXPIRATION: 101,
  // NOTE: Should be greater than 0, otherwise zero approvals will be enough to make an instant upgrade!
  SECURITY_COUNCIL_APPROVALS_FOR_EMERGENCY_UPGRADE: 1,
  PRIORITY_TX_MAX_GAS_LIMIT,
  DEPLOY_L2_BRIDGE_COUNTERPART_GAS_LIMIT,
  DUMMY_VERIFIER: false,
};
const testnetConfig = {
  UPGRADE_NOTICE_PERIOD: 0,
  // PRIORITY_EXPIRATION: 101,
  // NOTE: Should be greater than 0, otherwise zero approvals will be enough to make an instant upgrade!
  SECURITY_COUNCIL_APPROVALS_FOR_EMERGENCY_UPGRADE: 1,
  PRIORITY_TX_MAX_GAS_LIMIT,
  DEPLOY_L2_BRIDGE_COUNTERPART_GAS_LIMIT,
  DUMMY_VERIFIER: true,
};
const testConfig = {
  UPGRADE_NOTICE_PERIOD: 0,
  PRIORITY_EXPIRATION: 101,
  SECURITY_COUNCIL_APPROVALS_FOR_EMERGENCY_UPGRADE: 2,
  PRIORITY_TX_MAX_GAS_LIMIT,
  DEPLOY_L2_BRIDGE_COUNTERPART_GAS_LIMIT,
  DUMMY_VERIFIER: true,
};
const localConfig = {
  ...prodConfig,
  DUMMY_VERIFIER: true,
};

const contractDefs = {
  sepolia: testnetConfig,
  rinkeby: testnetConfig,
  ropsten: testnetConfig,
  goerli: testnetConfig,
  lineatest: testnetConfig,
  arbitrumtest: testnetConfig,
  mainnet: prodConfig,
  test: testConfig,
  localhost: localConfig,
  linea: prodConfig,
  arbitrum: prodConfig,
};

export default {
  defaultNetwork: "env",
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 9999999,
      },
      outputSelection: {
        "*": {
          "*": ["storageLayout"],
        },
      },
    },
  },
  contractSizer: {
    runOnCompile: false,
    except: ["dev-contracts", "zksync/upgrade-initializers", "zksync/libraries", "common/libraries"],
  },
  paths: {
    sources: "./contracts",
  },
  solpp: {
    defs: (() => {
      const defs = process.env.CONTRACT_TESTS ? contractDefs.test : contractDefs[process.env.CHAIN_ETH_NETWORK];

      return {
        ...systemParams,
        ...defs,
      };
    })(),
  },
  networks: {
    env: {
      url: process.env.ETH_CLIENT_WEB3_URL?.split(",")[0],
    },
    hardhat: {
      allowUnlimitedContractSize: false,
      forking: {
        url: "https://eth-goerli.g.alchemy.com/v2/" + process.env.ALCHEMY_KEY,
        enabled: process.env.TEST_CONTRACTS_FORK === "1",
      },
    },
  },
  etherscan: {
    apiKey: process.env.MISC_ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
  diamondAbi: {
    // (required) The name of your Diamond ABI.
    name: "ZkSyncDiamond",
    // (optional) An array of strings, matched against fully qualified contract names, to
    // determine which contracts are included in your Diamond ABI.
    include: ["IAdmin", "IExecutor", "IGetters", "IMailbox"],
    // (optional) An array of strings, matched against fully qualified contract names, to
    // determine which contracts are excluded from your Diamond ABI.
    exclude: [],
    // (optional) A function that is called with the ABI element, index, entire ABI,
    // and fully qualified contract name for each item in the combined ABIs.
    // If the function returns `false`, the function is not included in your Diamond ABI.
    filter: function (abiElement, index, fullAbi, fullyQualifiedName) {
      return abiElement.name !== "getName";
    },
    // (optional) Whether exact duplicate sighashes should cause an error to be thrown,
    // defaults to true.
    strict: true,
  },
};

task("solpp", "Preprocess Solidity source files").setAction(async (_, hre) =>
  hre.run(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS)
);
