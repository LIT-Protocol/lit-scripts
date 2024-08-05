import React, { useEffect, useRef, useState } from "react";
import { Nodebox } from "@codesandbox/nodebox";

const NodeBox = () => {
  const nodeboxIframeRef = useRef<HTMLIFrameElement>(null);
  const previewIframeRef = useRef<HTMLIFrameElement>(null);
  const [processId, setProcessId] = useState<string | null>(null);

  useEffect(() => {
    const setupNodebox = async () => {
      if (nodeboxIframeRef.current && previewIframeRef.current) {
        const runtime = new Nodebox({ iframe: nodeboxIframeRef.current });

        try {
          // Establish a connection with the runtime environment.
          console.log("Connecting to runtime...");
          await runtime.connect();
          console.log("Connected to runtime.");

          // Populate the in-memory file system of Nodebox with a Next.js project files.
          console.log("Initializing filesystem...");
          await runtime.fs.init({
            "package.json": JSON.stringify({
              name: "nextjs-preview",
              dependencies: {
                "@next/swc-wasm-nodejs": "12.1.6",
                next: "12.1.6",
                react: "18.2.0",
                "react-dom": "18.2.0",
              },
              scripts: {
                dev: "next dev",
              },
            }),
            "pages/index.jsx": `
              export default function Homepage({ name }) {
                return (
                  <div>
                    <h1>Hello, {name}</h1>
                    <p>The name "{name}" has been received from server-side props.</p>
                  </div>
                )
              }

              export function getServerSideProps() {
                return {
                  props: {
                    name: 'John'
                  }
                }
              }
            `,
          });
          console.log("Filesystem initialized.");

          // First, create a new shell instance.
          console.log("Creating shell instance...");
          const shell = runtime.shell.create();
          console.log("Shell instance created:", shell);

          // Then, let's run the "dev" script that we've defined
          // in "package.json" during the previous step.
          console.log("Running 'npm run dev'...");
          const nextProcess = await shell.runCommand("npm", ["run", "dev"]);

          console.log("Process started:", nextProcess);
          setProcessId(nextProcess.id); // Store the process ID in state
          const previewInfo = await runtime.preview.getByShellId(
            nextProcess.id
          );
          const previewIframe = document.getElementById("preview-iframe");
          previewIframe.setAttribute("src", previewInfo.url);
          // Retry logic to fetch preview info
          const fetchPreviewInfo = async (retries = 5) => {
            for (let i = 0; i < retries; i++) {
              console.log("nextProcess:", nextProcess);
              try {
                console.log("Fetching preview info (attempt", i + 1, ")...");
                const previewInfo = await runtime.preview.getByShellId(
                  nextProcess.id
                );
                if (previewInfo && previewInfo.url) {
                  console.log("Preview URL found:", previewInfo.url);
                  previewIframeRef.current.setAttribute("src", previewInfo.url);
                  return;
                }
              } catch (error) {
                console.error("Error fetching preview info:", error);
              }
              await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay between retries
            }
            console.error(
              "Failed to fetch preview info after multiple attempts."
            );
          };

          await fetchPreviewInfo();
        } catch (error) {
          console.error("Error setting up Nodebox:", error);
        }
      }
    };

    setupNodebox();
  }, []);

  return (
    <div>
      <h1>NodeBox</h1>
      <p>Process ID: {processId}</p> {/* Display the process ID */}
      <iframe
        id="nodebox-iframe"
        ref={nodeboxIframeRef}
        style={{ width: "100%", height: "400px", border: "1px solid black" }}
      ></iframe>
      <iframe
        id="preview-iframe"
        ref={previewIframeRef}
        style={{ width: "100%", height: "400px", border: "1px solid black" }}
      ></iframe>
    </div>
  );
};

export default NodeBox;
