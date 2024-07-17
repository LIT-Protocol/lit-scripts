import { ethers } from "ethers";
import { GENERAL_WORKER_URL_BY_NETWORK } from "@lit-protocol/constants";
import { ScriptDefinition, PerformanceResult, ScriptResults } from "./types";
import { ProviderType, RPC_URL_BY_NETWORK } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LIT_NETWORKS_KEYS } from "@lit-protocol/types";
import {
  EthWalletProvider,
  LitAuthClient,
} from "@lit-protocol/lit-auth-client";

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
      `\x1b[90m⌛️ Performance: ${operationName} took ${duration}ms\x1b[0m`
    );
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

      const workerApi = GENERAL_WORKER_URL_BY_NETWORK[network];

      const response = await profilePerformance(
        () => fetch(workerApi),
        "Fetch worker API",
        performanceResults
      );
      const data = await profilePerformance(
        () => response.json(),
        "Parse JSON",
        performanceResults
      );

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

      const minNodeCount = await profilePerformance(
        () => stakingContract["currentValidatorCountForConsensus"](),
        "currentValidatorCountForConsensus",
        performanceResults
      );
      console.log("minNodeCount:", minNodeCount);

      const validatorsInCurrentEpoch = await profilePerformance(
        () => stakingContract["getValidatorsInCurrentEpoch"](),
        "getValidatorsInCurrentEpoch",
        performanceResults
      );
      console.log("validatorsInCurrentEpoch:", validatorsInCurrentEpoch);

      const currentValidatorCountForConsensus = await profilePerformance(
        () => stakingContract["currentValidatorCountForConsensus"](),
        "currentValidatorCountForConsensus",
        performanceResults
      );
      console.log(
        "currentValidatorCountForConsensus:",
        currentValidatorCountForConsensus
      );

      const kickedValidators = await stakingContract["getKickedValidators"]();
      console.log("kickedValidators:", kickedValidators);

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
      const performanceResults: PerformanceResult[] = [];

      const TESTING_NETWORK = network as LIT_NETWORKS_KEYS;
      const PRIVATE_KEY =
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";

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

      console.log("authMethod:", authMethod);

      const mintRequestId = await profilePerformance(
        () => ethWalletProvider.mintPKPThroughRelayer(authMethod),
        "mintPKPThroughRelayer",
        performanceResults
      );

      console.log("mintRequestId:", mintRequestId);

      const pkps = await profilePerformance(
        () => ethWalletProvider.fetchPKPsThroughRelayer(authMethod),
        "fetchPKPsThroughRelayer",
        performanceResults
      );

      console.log("pkps:", pkps);

      return {
        performanceResults,
      };
    },
  },
  demoScript: {
    name: "Demo Script",
    run: async (): Promise<ScriptResults> => {
      const performanceResults: PerformanceResult[] = [];

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return {
        performanceResults,
      };
    },
  },
};
