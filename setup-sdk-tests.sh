#!/bin/bash

set +e

headerLog() {
  echo
  echo "===== $1 ====="
}

headerLog "🔧 Checking for bun installation"
if command -v bun &> /dev/null
then
    echo "bun is already installed"
else
    curl -fsSL https://bun.sh/install | bash
fi

headerLog "🔍 Cloning the repository"
git clone https://github.com/LIT-Protocol/test-sdk-for-nodes-ppl .

headerLog "🗑️ Removing the .git directory"
rm -rf .git

headerLog "🔍 Cloning the sdk-tests repository"
git clone https://github.com/LIT-Protocol/sdk-tests

headerLog "📂 Moving all the content into the root"
mv sdk-tests/* .

headerLog "🗑️ Deleting the sdk-tests folder"
rm -rf sdk-tests

headerLog "🚀 Starting the installation process"
bun install

headerLog "📦 Getting the latest contracts"
bun run ./node_modules/@getlit/contracts/index.mjs

headerLog "🔗 Linking the package in the root directory"
bun link @lit-protocol/lit-node-client --save

headerLog "📝 Generating scripts"
bun gen-scripts.mjs

headerLog "📝 Generating lit config"
bun gen-lit-config.mjs

# ----- Getting JS SDK -----
headerLog "🔍 Cloning the repository"
git clone --branch feat/SDK-V3 https://github.com/LIT-Protocol/js-sdk.git lit-js-sdk

headerLog "📂 Changing directory to the cloned repository"
cd lit-js-sdk

headerLog "🔧 Installing dependencies"
bun install

headerLog "🏗️ Building the project"
bun run build

headerLog "📂 Listing directories"
ls

headerLog "📂 Changing directory to lit-node-client/dist"
cd packages/lit-node-client/dist

headerLog "🔗 Linking the package"
bun link

headerLog "🔙 Returning to the root directory"
cd ../../../..

# ----- Root -----
headerLog "🖨️ Printing available test commands in package.json:"
cat package.json | grep -o '"test.*"'