# @delegare/mcp-tools

A collection of Model Context Protocol (MCP) tools that enable AI agents to autonomously execute payments and handle `x402` paywalls using the **Delegare** protocol.

This package exposes a set of Zod-validated, secure MCP tools that integrate directly with the `@delegare/sdk`.

---

## Installation

```bash
pnpm add @delegare/mcp-tools @delegare/sdk
# or
npm install @delegare/mcp-tools @delegare/sdk
```

---

## Provided Tools

When you register these tools, the agent gains the ability to:

*   **`delegare_fetch`**: Fetch a URL. If the resource returns a `402 Payment Required` (x402 protocol), the tool automatically intercepts the challenge, signs an EIP-3009 transaction using the agent's active spending mandate, and seamlessly retries the request to fetch the premium data.
*   **`authorize_agent_payment`**: Manually execute a payment to a specified merchant using the agent's pre-authorized spending mandate.
*   **`setup_spending_mandate`**: Generate a secure setup URL to send to the human user so they can authorize a spending budget (e.g., "$50 max per month").
*   **`poll_setup_session`**: Check the status of a pending setup session to retrieve the newly minted `intentMandate` (SD-JWT-VC) once the user has approved it.
*   **`check_mandate_balance`**: Query the remaining monthly budget for an active mandate.
*   **`revoke_mandate`**: Instantly revoke the active spending mandate.

---

## Usage in Custom MCP Servers

You can register these tools in any standard MCP server. The `registerDelegareTools` function injects the tools into your server instance.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerDelegareTools } from "@delegare/mcp-tools";

const server = new McpServer({
  name: "my-custom-agent",
  version: "1.0.0"
});

// Register the Delegare payment tools
registerDelegareTools(server, {
  merchantId: process.env.DELEGARE_MERCHANT_ID, // Your merchant/platform ID
  apiKey: process.env.DELEGARE_API_KEY,         // Your API key
  
  // Optional: Restrict the agent to only making payments of specific amounts
  allowedAmountsCents: [500, 1000], // Only $5 and $10 allowed
});

// ... start your transport ...
```

---

## Security

*   **No Wallet Popups:** Tools like `delegare_fetch` use the agent's pre-authorized `intentMandate` to securely sign transactions server-side, eliminating the need for browser-based wallet popups during automated execution.
*   **Zero Exposure:** The API Key and Merchant ID are injected securely via the server closure. They are never exposed to the LLM prompt or output.
*   **Strict Bounds:** All payments executed via these tools are strictly bounded by the human-defined limits set during the setup session (e.g., max per transaction, max per month).

---

## Links
- [Documentation](https://docs.delegare.dev)
- [Dashboard](https://app.delegare.dev)
- [GitHub](https://github.com/delegare)