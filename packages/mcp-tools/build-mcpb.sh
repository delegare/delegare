#!/bin/bash
set -e

echo "🔨 Building Delegare MCP Server..."

cd "$(dirname "$0")"
PROJECT_ROOT=$(pwd)
WORKSPACE_ROOT=$(cd ../.. && pwd)

# Install esbuild if not present
pnpm add -D esbuild

# Create temp dir
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Bundle the server
echo "📦 Bundling with esbuild..."
npx esbuild src/server.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=cjs \
  --outfile="$TEMP_DIR/dist/server.cjs" \
  --minify \
  --charset=utf8 \
  --banner:js='#!/usr/bin/env node'

chmod +x "$TEMP_DIR/dist/server.cjs"

# Create manifest.json
cat > "$TEMP_DIR/manifest.json" << MANIFEST
{
  "manifest_version": "0.2",
  "name": "delegare",
  "display_name": "Delegare",
  "version": "1.0.0",
  "description": "Delegare Model Context Protocol (MCP) server for AI agents to securely execute autonomous payments and overcome paywalls.",
  "author": {
    "name": "Delegare",
    "url": "https://delegare.dev"
  },
  "server": {
    "type": "node",
    "entry_point": "dist/server.cjs",
    "mcp_config": {
      "command": "node",
      "args": ["\${__dirname}/dist/server.cjs"],
      "env": {}
    }
  },
  "tools": [
    {
      "name": "delegare_fetch",
      "description": "A drop-in replacement for the standard web fetch that automatically negotiates and settles x402 payment requirements."
    },
    {
      "name": "delegare_pay",
      "description": "Directly push funds to a recipient wallet or merchant handle."
    },
    {
      "name": "setup_spending_mandate",
      "description": "Generate a setup URL for a user to authorize a spending budget for their agent."
    },
    {
      "name": "poll_setup_session",
      "description": "Poll the status of a setup session to check if the user has approved the mandate."
    },
    {
      "name": "check_balance",
      "description": "Check the remaining allowed budget on a spending mandate."
    },
    {
      "name": "revoke_spending_mandate",
      "description": "Permanently revoke an active spending mandate."
    }
  ],
  "keywords": ["payments", "x402", "crypto", "fiat", "autonomous"],
  "license": "MIT"
}
MANIFEST

# Minimal package.json
cat > "$TEMP_DIR/package.json" << PKGJSON
{
  "name": "@delegare/mcp-desktop",
  "version": "1.0.0"
}
PKGJSON

# Zip it
cd "$TEMP_DIR"
zip -r "${WORKSPACE_ROOT}/delegare.mcpb" . -x "*.DS_Store"
cd -

echo "✅ Created delegare.mcpb at ${WORKSPACE_ROOT}/delegare.mcpb"
