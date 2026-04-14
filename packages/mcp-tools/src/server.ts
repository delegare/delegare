#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDelegareTools } from "./tools.js";

async function main() {
  const server = new McpServer({
    name: "delegare-mcp",
    version: "1.0.0",
  });

  // Extract base URL from CLI args (e.g. node server.cjs --api-url=https://api.sandbox.delegare.dev)
  const args = process.argv.slice(2);
  let baseUrl = process.env.API_BASE_URL || 'https://api.delegare.dev';
  
  for (const arg of args) {
    if (arg.startsWith('--api-url=')) {
      baseUrl = arg.split('=')[1];
    }
  }

  registerDelegareTools(server, {
    // The standalone 1-click MCP extension doesn't inherently belong to a single merchant.
    // However, the SDK expects these to be defined. We pass undefined/dummy values here 
    // because the tools dynamically resolve authentication from MCP context/headers 
    // or rely on user inputs.
    merchantId: 'mcp-desktop-client',
    baseUrl
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`Delegare MCP Server running on stdio (API: ${baseUrl})`);
}

main().catch(console.error);
