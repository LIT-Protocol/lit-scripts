import { ethers } from "ethers";
import {
  // LIT_NETWORK_TYPES,
  // LIT_NETWORK_VALUES,
  NETWORK_CONTEXT_BY_NETWORK,
} from "@lit-protocol/constants";
import { ScriptDefinition, PerformanceResult, ScriptResults } from "./types";
import { ProviderType, RPC_URL_BY_NETWORK } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";
import { getCachedValue } from "./utils";

const CACHE_KEY = "privateKeyCacheABC"; // Use a unique key to avoid conflicts

async function profilePerformance<T>(
  operation: () => Promise<T>,
  operationName: string,
  performanceResults: PerformanceResult[]
): Promise<T> {
  const start = performance.now();
  try {
    const result = await operation();
    const end = performance.now();
    const duration = Number((end - start).toFixed(2));
    performanceResults.push({ operationName, duration });
    console.log(
      `\x1b[90m[Performance] ${operationName} took ${duration}ms\x1b[0m`
    );
    console.log(result);
    return result;
  } catch (error) {
    const end = performance.now();
    const duration = Number((end - start).toFixed(2));
    performanceResults.push({ operationName, duration });
    console.error(`❌  Error in ${operationName}: ${error}`);
    console.log(`❌ Performance: ${operationName} failed after ${duration}ms`);
    throw error;
  }
}
export const scripts: Record<string, ScriptDefinition> = {
  stakingInfo: {
    name: "Staking Info",
    run: async (
      ethersProvider: ethers.providers.JsonRpcProvider,
      network: string
    ): Promise<ScriptResults> => {
      const performanceResults: PerformanceResult[] = [];

      const data = NETWORK_CONTEXT_BY_NETWORK[network];

      const stakingData = data.data.filter(
        (contract: { name: string }) => contract.name === "Staking"
      )[0].contracts[0];

      const stakingAddress = stakingData.address_hash;
      const stakingABI = stakingData.ABI;

      if (!stakingAddress || !stakingABI) {
        throw new Error("Staking contract not found");
      }

      const stakingContract = new ethers.Contract(
        stakingAddress,
        stakingABI,
        ethersProvider
      );

      await profilePerformance(
        () => stakingContract["currentValidatorCountForConsensus"](),
        "currentValidatorCountForConsensus",
        performanceResults
      );

      await profilePerformance(
        () => stakingContract["getValidatorsInCurrentEpoch"](),
        "getValidatorsInCurrentEpoch",
        performanceResults
      );

      await profilePerformance(
        () => stakingContract["currentValidatorCountForConsensus"](),
        "currentValidatorCountForConsensus",
        performanceResults
      );

      await profilePerformance(
        () => stakingContract["getKickedValidators"](),
        "getKickedValidators",
        performanceResults
      );

      return {
        performanceResults,
      };
    },
  },
  litNodeClient: {
    name: "Lit Node Client",
    run: async (
      // @ts-ignore
      ethersProvider: ethers.providers.JsonRpcProvider,
      network: string
    ): Promise<ScriptResults> => {
      const performanceResults: PerformanceResult[] = [];

      const litNodeClient = new LitNodeClient({
        litNetwork: network as LIT_NETWORKS_KEYS,
        debug: true,
      });

      await profilePerformance(
        () => litNodeClient.connect(),
        "LitNodeClient connect",
        performanceResults
      );

      return {
        performanceResults,
      };
    },
  },
  relayerMinting: {
    name: "Relayer Minting",
    run: async (
      // @ts-expect-error
      ethersProvider: ethers.providers.JsonRpcProvider,
      network: string
    ): Promise<ScriptResults> => {
      const PRIVATE_KEY = getCachedValue(
        CACHE_KEY,
        "Please enter your private key for relayer minting:"
      );

      if (!PRIVATE_KEY) {
        throw new Error("Private key is required");
      }

      const performanceResults: PerformanceResult[] = [];

      const TESTING_NETWORK = network as LIT_NETWORKS_KEYS;

      // -- config
      const rpc = RPC_URL_BY_NETWORK[TESTING_NETWORK];
      const provider = new ethers.providers.StaticJsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

      // -- go
      const litNodeClient = new LitNodeClient({
        litNetwork: TESTING_NETWORK,
      });

      await profilePerformance(
        () => litNodeClient.connect(),
        "LitNodeClient connect",
        performanceResults
      );

      const litAuthClient = new LitAuthClient({
        litRelayConfig: {
          relayApiKey: "test-api-key",
        },
        litNodeClient: litNodeClient,
      });

      // -- test fetch pkps
      const ethWalletProvider = litAuthClient.initProvider<EthWalletProvider>(
        ProviderType.EthWallet
      );

      const authMethod = await profilePerformance(
        () =>
          EthWalletProvider.authenticate({
            signer: wallet,
            litNodeClient,
          }),
        "EthWalletProvider authenticate",
        performanceResults
      );

      await profilePerformance(
        () => ethWalletProvider.mintPKPThroughRelayer(authMethod),
        "mintPKPThroughRelayer",
        performanceResults
      );

      await profilePerformance(
        () => ethWalletProvider.fetchPKPsThroughRelayer(authMethod),
        "fetchPKPsThroughRelayer",
        performanceResults
      );

      await profilePerformance(
        () => litNodeClient.disconnect(),
        "LitNodeClient disconnect",
        performanceResults
      );

      return {
        performanceResults,
      };
    },
  },
};
