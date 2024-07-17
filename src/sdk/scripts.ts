import { ethers } from "ethers";
import { GENERAL_WORKER_URL_BY_NETWORK } from "@lit-protocol/constants";
import {
  ScriptDefinition,
  StakingInfoResults,
  DemoScriptResults,
} from "./types";

export const scripts: Record<string, ScriptDefinition> = {
  stakingInfo: {
    name: "Staking Info",
    run: async (
      ethersProvider: ethers.providers.JsonRpcProvider,
      network: string
    ): Promise<StakingInfoResults> => {
      const workerApi = GENERAL_WORKER_URL_BY_NETWORK[network];
      const response = await fetch(workerApi);
      const data = await response.json();
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

      const minNodeCount = await stakingContract[
        "currentValidatorCountForConsensus"
      ]();
      const validatorsInCurrentEpoch = await stakingContract[
        "getValidatorsInCurrentEpoch"
      ]();
      const currentValidatorCountForConsensus = await stakingContract[
        "currentValidatorCountForConsensus"
      ]();
      const kickedValidators = await stakingContract["getKickedValidators"]();

      return {
        stakingAddress,
        minNodeCount: minNodeCount.toString(),
        validatorsInCurrentEpoch,
        currentValidatorCountForConsensus:
          currentValidatorCountForConsensus.toString(),
        kickedValidators,
      };
    },
  },
  demoScript: {
    name: "Demo Script",
    run: async (): Promise<DemoScriptResults> => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        demoValue1: "This is a demo value",
        demoValue2: 42,
      };
    },
  },
};
