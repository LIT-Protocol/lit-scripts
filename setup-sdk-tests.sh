#!/bin/bash

# This script sets up the SDK tests for the LIT protocol.
# It clones the necessary repositories, installs dependencies, and prepares the environment for testing.
# 
# Usage:
# ./setup-sdk-tests.sh
# 
# To reset the whole current directory, you can use the following command:
# find . -maxdepth 1 -mindepth 1 -exec rm -rf {} +
# 
# If this script is hosted somewhere, you can execute it using the following command:
# curl --sSSL <url> | bash
# Note: If you are using environment variables, they have to be placed before the curl command.
# 
# Environment variables:
# ROOT_DIR: The root directory for the setup. Defaults to the current directory.
# BRANCH: The branch to clone from the JS SDK repository. Defaults to 'feat/SDK-V3'.
# TESTING_ENV_REPO: The repository for the testing environment. Defaults to 'https://github.com/LIT-Protocol/test-sdk-for-nodes-ppl'.
# SDK_TESTS_REPO: The repository for the SDK tests. Defaults to 'https://github.com/LIT-Protocol/sdk-tests'.
# JS_SDK_REPO: The repository for the JS SDK. Defaults to 'https://github.com/LIT-Protocol/js-sdk.git'.

set +e

ROOT_DIR=${ROOT_DIR:-$(pwd)}
BRANCH=${BRANCH:-feat/SDK-V3}
TESTING_ENV_REPO=${TESTING_ENV_REPO:-https://github.com/LIT-Protocol/test-sdk-for-nodes-ppl}
SDK_TESTS_REPO=${SDK_TESTS_REPO:-https://github.com/LIT-Protocol/sdk-tests}
JS_SDK_REPO=${JS_SDK_REPO:-https://github.com/LIT-Protocol/js-sdk.git}

echo "Branch" $BRANCH

# Settings

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
    # Check if bun command is available after installation
    if ! command -v bun &> /dev/null
    then
        echo "bun command is not available. Please source it first.eg  source ~/.zshrc"
        exit 1
    fi
fi

headerLog "🔍 Cloning the repository"
git clone $TESTING_ENV_REPO $ROOT_DIR

headerLog "🗑️ Removing the .git directory"
rm -rf $ROOT_DIR/.git

headerLog "🔍 Cloning the sdk-tests repository"
git clone $SDK_TESTS_REPO $ROOT_DIR/sdk-tests

headerLog "📂 Moving all the content into the root"
mv $ROOT_DIR/sdk-tests/* $ROOT_DIR

headerLog "🗑️ Deleting the sdk-tests folder"
rm -rf $ROOT_DIR/sdk-tests

headerLog "🚀 Starting the installation process"
cd $ROOT_DIR && bun install

headerLog "📦 Getting the latest contracts"
bun run $ROOT_DIR/node_modules/@getlit/contracts/index.mjs

# ----- Getting JS SDK -----
headerLog "🔍 Cloning the repository"
git clone --branch $BRANCH $JS_SDK_REPO $ROOT_DIR/lit-js-sdk

headerLog "📂 Changing directory to the cloned repository"
cd $ROOT_DIR/lit-js-sdk

headerLog "🗑️ Removing the .git directory"
# rm -rf $ROOT_DIR/lit-js-sdk/.git

headerLog "🔧 Installing dependencies"
yarn

headerLog "🏗️ Building the project"
yarn build & wait $!

headerLog "📂 Listing directories"
ls

headerLog "📂 Changing directory to $ROOT_DIR/lit-js-sdk/packages/lit-node-client/dist"
cd "$ROOT_DIR/lit-js-sdk/packages/lit-node-client/dist"

headerLog "🔗 Linking the package"
bun link

headerLog "🔙 Returning to the root directory"
echo $ROOT_DIR
cd $ROOT_DIR

# ----- Root -----
headerLog "🔗 Linking the package in the root directory"
bun link @lit-protocol/lit-node-client --save

headerLog "📝 Generating scripts"
bun "$ROOT_DIR/gen-scripts.mjs"

headerLog "📝 Generating lit config"
bun "$ROOT_DIR/gen-lit-config.mjs"

headerLog "🖨️ Printing available test commands in package.json:"
cat $ROOT_DIR/package.json | grep -o '"test.*"'

headerLog "🔧 Initializing git"
git init

headerLog "🔗 Adding origin"
git remote add origin $TESTING_ENV_REPO