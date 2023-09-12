#!/bin/bash

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

headerLog "🚀 Starting the installation process"
bun install

