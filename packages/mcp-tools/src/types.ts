import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export interface RegisterDelegareToolsOptions {
  merchantId: string;
  /** Optional when using the standalone MCP server — auth is resolved from MCP context headers at runtime. */
  apiKey?: string;
  baseUrl?: string;
  /**
   * Optional whitelist of allowed charge amounts in cents.
   * If set, any charge not in this list will be rejected.
   */
  allowedAmountsCents?: number[];
}

export type DelegareServer = McpServer;
