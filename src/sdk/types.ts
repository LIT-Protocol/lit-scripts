import { ethers } from "ethers";
import { AuthMethod } from "@lit-protocol/types";

export interface PerformanceResult {
  operationName: string;
  duration: number;
}

export type ScriptResults = {
  performanceResults: PerformanceResult[];
};

export interface ScriptDefinition {
  name: string;
  run: (
    ethersProvider: ethers.providers.JsonRpcProvider,
    network: string
  ) => Promise<ScriptResults>;
}
