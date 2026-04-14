#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDelegareTools } from "./tools.js";

async function main() {
  const server = new McpServer({
    name: "delegare-mcp",
    version: "1.0.0",
  });

  registerDelegareTools(server, {
    // The standalone 1-click MCP extension doesn't inherently belong to a single merchant.
    // However, the SDK expects these to be defined. We pass undefined/dummy values here 
    // because the tools dynamically resolve authentication from MCP context/headers 
    // or rely on user inputs.
    merchantId: 'mcp-desktop-client',
    baseUrl: process.env.API_BASE_URL || 'https://api.delegare.dev'
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Delegare MCP Server running on stdio");
}

main().catch(console.error);
