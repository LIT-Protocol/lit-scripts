import { ethers } from "ethers";

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
