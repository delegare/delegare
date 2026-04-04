import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDelegareTools } from "@delegare/mcp-tools";

async function main() {
  const server = new McpServer({
    name: "delegare-openclaw",
    version: "0.1.0"
  });

  // Register Delegare tools without requiring API credentials initially.
  // The OAuth flow will populate the necessary _meta properties on each request.
  registerDelegareTools(server, {
    // We pass empty credentials here because the OpenClaw OAuth integration
    // automatically attaches credentials securely to the request metadata
    merchantId: "", 
    apiKey: ""
  });
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Delegare OpenClaw MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error starting Delegare OpenClaw MCP plugin:", error);
  process.exit(1);
});
