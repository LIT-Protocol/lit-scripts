import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RPC_URL_BY_NETWORK, LIT_NETWORK } from "@lit-protocol/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PerformanceResult, ScriptResults, scripts } from "./sdk";

const NETWORKS = Object.keys(RPC_URL_BY_NETWORK).filter(
  (network) => network !== "custom" && network !== "localhost"
);

interface NetworkSelectorProps {
  onNetworkChange: (network: string) => void;
  currentNetwork: string;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  onNetworkChange,
  currentNetwork,
}) => {
  return (
    <div className="flex flex-col">
      <label htmlFor="network-select" className="mb-2 text-sm font-medium">
        Select Network
      </label>
      <Select onValueChange={onNetworkChange} value={currentNetwork}>
        <SelectTrigger id="network-select" className="w-[180px]">
          <SelectValue placeholder="Select network" />
        </SelectTrigger>
        <SelectContent>
          {NETWORKS.map((network) => (
            <SelectItem key={network} value={network}>
              {network}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

interface ScriptSelectorProps {
  onScriptChange: (script: string) => void;
  scripts: Record<string, { name: string }>;
  currentScript: string;
}
interface URLDisplayProps {
  url: string;
}

const URLDisplay: React.FC<URLDisplayProps> = ({ url }) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const urlInputRef = useRef<HTMLInputElement>(null);

  const copyUrlToClipboard = () => {
    if (urlInputRef.current) {
      urlInputRef.current.select();
      document.execCommand("copy");
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <div className="flex items-center space-x-2 mt-4">
      <input
        ref={urlInputRef}
        type="text"
        value={url}
        readOnly
        className="flex-grow bg-gray-100 text-gray-700 py-2 px-3 rounded-lg focus:outline-none"
      />
      <Button onClick={copyUrlToClipboard}>
        {copySuccess ? "Copied!" : "Copy"}
      </Button>
    </div>
  );
};

const ScriptSelector: React.FC<ScriptSelectorProps> = ({
  onScriptChange,
  scripts,
  currentScript,
}) => {
  return (
    <div className="flex flex-col">
      <label htmlFor="script-select" className="mb-2 text-sm font-medium">
        Select Script
      </label>
      <Select onValueChange={onScriptChange} value={currentScript}>
        <SelectTrigger id="script-select" className="w-[180px]">
          <SelectValue placeholder="Select script" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(scripts).map(([key, script]) => (
            <SelectItem key={key} value={key}>
              {script.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const renderPerformanceTable = (performanceResults: PerformanceResult[]) => (
  <table className="min-w-full bg-white border border-gray-300 mt-4">
    <thead>
      <tr>
        <th className="px-4 py-2 bg-gray-100 border-b">Operation</th>
        <th className="px-4 py-2 bg-gray-100 border-b">Duration (ms)</th>
      </tr>
    </thead>
    <tbody>
      {performanceResults.map((result, index) => (
        <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
          <td className="px-4 py-2 border-b">{result.operationName}</td>
          <td className="px-4 py-2 border-b text-right">{result.duration}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const renderResults = (results: ScriptResults) => {
  return <div>{renderPerformanceTable(results.performanceResults)}</div>;
};

const StakingInfo: React.FC = () => {
  const defaultNetwork = LIT_NETWORK.DatilDev;
  const defaultScript = Object.keys(scripts)[0];

  const [network, setNetwork] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const networkParam = searchParams.get("network");
    return networkParam && NETWORKS.includes(networkParam)
      ? networkParam
      : defaultNetwork;
  });

  const [script, setScript] = useState<string>(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const scriptParam = searchParams.get("script");
    return scriptParam && scripts.hasOwnProperty(scriptParam)
      ? scriptParam
      : defaultScript;
  });

  const [results, setResults] = useState<ScriptResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>(window.location.href);

  useEffect(() => {
    const searchParams = new URLSearchParams();
    searchParams.set("network", network);
    searchParams.set("script", script);
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState(null, "", newUrl);
    setCurrentUrl(`${window.location.origin}${newUrl}`);
  }, [network, script]);

  useEffect(() => {
    setResults(null);
  }, [script, network]);

  const runScript = async () => {
    setIsLoading(true);
    setError(null);
    setExecutionTime(null);
    const startTime = performance.now();

    try {
      const rpc = RPC_URL_BY_NETWORK[network];
      const ethersProvider = new ethers.providers.StaticJsonRpcProvider(rpc);

      const scriptResults = await scripts[script].run(ethersProvider, network);
      setResults(scriptResults);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Lit Scripts Runner</h1>
      <div className="flex space-x-4 mb-4">
        <NetworkSelector
          onNetworkChange={setNetwork}
          currentNetwork={network}
        />
        <ScriptSelector
          onScriptChange={setScript}
          scripts={scripts}
          currentScript={script}
        />
      </div>
      <Button onClick={runScript} disabled={isLoading} className="mt-4">
        {isLoading ? "Loading..." : `Run ${scripts[script].name}`}
      </Button>
      <URLDisplay url={currentUrl} />
      {error && (
        <Card className="mt-4 bg-red-100">
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      {results && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Performance Results</CardTitle>
          </CardHeader>
          <CardContent>{renderResults(results)}</CardContent>
        </Card>
      )}
      {executionTime !== null && (
        <p className="mt-4">
          <strong>Execution Time:</strong> {executionTime.toFixed(2)} ms
        </p>
      )}
    </div>
  );
};

export default StakingInfo;
