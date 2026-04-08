# @delegare/openclaw-plugin

The official **Delegare** plugin for OpenClaw. This plugin acts as a standalone Model Context Protocol (MCP) server, giving your OpenClaw agents the ability to autonomously execute payments and bypass `x402` paywalls.

By connecting this plugin, your agent gains access to the `@delegare/mcp-tools` suite, allowing it to spend funds safely using a pre-authorized **AP2 Intent Mandate (SD-JWT-VC)** without needing you to approve every transaction.

---

## Installation & Setup

1. Install the plugin package:
```bash
npm install -g @delegare/openclaw-plugin
```

2. Add the MCP server to your OpenClaw configuration:
Open OpenClaw → Settings → MCP Servers → Add Server:
*   **Name:** Delegare
*   **Command:** `npx`
*   **Args:** `-y @delegare/openclaw-plugin`
*   **Auth:** OAuth 2.0 (Connects securely to your Delegare account)

## 3. Authorize

Once added, click **Connect** in OpenClaw. You'll be redirected to the Delegare Dashboard to:
- Connect your preferred payment method (Stripe card or Base USDC wallet).
- Set your agent's autonomous spending limits (e.g., "$50 max per month").
- Confirm the setup.

At the end of this flow, Delegare issues an **AP2 Intent Mandate** to your OpenClaw agent.

## 4. Start using it

Your agent can now seamlessly access monetized data! Try prompting OpenClaw with:
*   *"Fetch the premium weather data from this URL. If it requires an x402 payment, use your mandate to pay it."*
*   *"What's my Delegare mandate balance?"*
*   *"Pay @merchant_handle $5.00 for the premium subscription."*

---

## Security

*   **Zero Popups:** Once you set the limit, your agent handles all `x402` transaction signing server-side. No wallet popups will interrupt its workflow.
*   **No Master Keys:** Your crypto wallet's master private key never leaves your device. The agent only receives a tightly scoped, easily revokable session key.
*   **Strict Enforcement:** The Vault backend strictly enforces your $ transaction and monthly limits.

## Links
- [Documentation](https://docs.delegare.dev)
- [Dashboard](https://app.delegare.dev)
- [GitHub](https://github.com/delegare)
