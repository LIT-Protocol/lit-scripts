import fs from "fs";
import path from "path";

/**
 * Retrieves the versions of @lit-protocol packages from the package.json file.
 * @returns An object containing the @lit-protocol packages and their versions, or null if there was an error.
 */
function checkLitProtocolVersions() {
  // Get the current working directory
  const currentDir = process.cwd();

  // Construct the path to package.json
  const packageJsonPath = path.join(currentDir, "package.json");

  try {
    // Read the package.json file
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");

    // Parse the JSON content
    const packageJson = JSON.parse(packageJsonContent);

    // Get all dependencies
    const allDependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Filter and collect @lit-protocol packages
    const litProtocolPackages = Object.entries(allDependencies)
      .filter(([packageName]) => packageName.startsWith("@lit-protocol"))
      .reduce((acc, [packageName, version]) => {
        acc[packageName] = version;
        return acc;
      }, {});

    return litProtocolPackages;
  } catch (error) {
    console.error("Error reading or parsing package.json:", error);
    return null;
  }
}

// Example usage
const litPackages = checkLitProtocolVersions();

// write this to a json file
fs.writeFileSync(
  path.join(process.cwd(), "./src/autogen/lit-protocol-versions.ts"),
  `export const LIT_PACKAGES = ${JSON.stringify(
    litPackages,
    null,
    2
  )} as const;`
);

console.log("🔥 Lit Protocol packages versions written to autogen file");
