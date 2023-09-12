#!/bin/bash

headerLog() {
  echo
  echo "===== $1 ====="
}

curl -fsSL https://bun.sh/install | bash

headerLog "🔍 Cloning the repository"
git clone https://github.com/LIT-Protocol/test-sdk-for-nodes-ppl .

headerLog "🚀 Starting the installation process"
bun install

