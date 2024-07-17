import { ethers } from "ethers";

export interface StakingInfoResults {
  stakingAddress: string;
  minNodeCount: string;
  validatorsInCurrentEpoch: string[];
  currentValidatorCountForConsensus: string;
  kickedValidators: string[];
}

export interface DemoScriptResults {
  demoValue1: string;
  demoValue2: number;
}

export type ScriptResults = StakingInfoResults | DemoScriptResults;

export interface ScriptDefinition {
  name: string;
  run: (
    ethersProvider: ethers.providers.JsonRpcProvider,
    network: string
  ) => Promise<ScriptResults>;
}
