#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDelegareTools } from "./tools.js";

async function main() {
  const server = new McpServer({
    name: "delegare-mcp",
    version: "1.0.0",
  });

  registerDelegareTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Delegare MCP Server running on stdio");
}

main().catch(console.error);
