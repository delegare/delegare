# Setting up Delegare in OpenClaw

## Prerequisites
- OpenClaw account
- Delegare merchant or user account

## 1. Add the MCP server

In OpenClaw → Settings → MCP Servers → Add Server:

Name:      Delegare
URL:       https://mcp.delegare.dev/mcp
Auth:      OAuth 2.0

## 2. Authorize

Click Connect. You'll be redirected to Delegare to:
- Connect your payment method (card or USDC wallet)
- Set your spending limits
- Confirm

Takes about 60 seconds. Your card details never 
reach OpenClaw or Delegare — Stripe handles them.

## 3. Start using it

Tell OpenClaw:
"What's my Delegare balance?"
"Pay [merchant] $X for [description]"
"Revoke my Delegare spending delegate"

## Your handle

After connecting a USDC wallet, you'll receive a 
Delegare handle — e.g. swift-amber-narwhal.
Anyone with a Delegare-connected agent can send 
you USDC at that address.

## Troubleshooting

Token expired: run setup_payment_delegate again
Limit exceeded: update limits at app.delegare.dev
Wrong merchant: check your allowed merchants list
