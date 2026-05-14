# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [@delegare/x402] 0.5.18 — 2026-05-14

### Fixed
- **CDP Bazaar indexing**: Pass `decodedSig` (the full `@x402/fetch` payment payload) directly to CDP `/settle` instead of reconstructing it manually. The reconstructed payload discarded `paymentPayload.resource`, `paymentPayload.extensions.bazaar`, and `paymentPayload.accepted` — all required for CDP's indexer to write the catalog entry. This is the fix that finally triggered agentic.market listing.

## [@delegare/x402] 0.5.17 — 2026-05-14

### Added
- **CDP JWT authentication**: When `COINBASE_API_KEY` and `COINBASE_API_SECRET` env vars are set, the middleware builds a signed Ed25519 JWT and attaches `Authorization: Bearer <jwt>` to CDP `/settle` calls. Required for authenticated Bazaar catalog writes.
- **`resource` in `paymentRequirements`**: Added `resource` URL to the `paymentRequirements` object sent to CDP's facilitator alongside `paymentPayload.resource`.

## [@delegare/x402] 0.5.16 — 2026-05-13

### Fixed
- **`output.schema` in bazaar extension**: Top-level `bazaar.schema` now populated from `output.schema`. Previously absent, causing agentic.market validator to report "schema is invalid" despite 5/5 checks passing.
- **`body` field uses `inputSchema`**: `inputSchema` is now passed as `body` in `info.input` instead of falling back to `{}`. Previously the inputSchema was silently discarded.
- **`outputSchema` in MPP challenge**: `WWW-Authenticate` challenge now uses `output.schema` (with `properties`) as `outputSchema`. Fixes MPPScan "Output schema missing" errors.

## [@delegare/x402] 0.5.15 — 2026-05-13

### Added
- **MPP discovery (`WWW-Authenticate`)**: Every 402 response now emits a `WWW-Authenticate: Payment realm="...", method="x402+mpp"` header (RFC 7235) alongside `PAYMENT-REQUIRED`. MPPScan reads this for endpoint discovery — no separate registration step.
- `inputSchema` and `outputSchema` embedded in the MPP challenge `request` field.

### Changed
- `protocols` in openapi.json `x-payment-info` changed from string array to object array `[{"x402":{}},{"mpp":{}}]` — required by MPPScan validator.
- `price` in `x-payment-info` changed to `{ mode: "fixed", amount, currency }` object format.
- `responses200` now uses proper JSON Schema `properties` instead of bare `example` objects.

## [@delegare/x402] 0.5.14 — 2026-05-12

### Added
- **x402 v2 `PAYMENT-REQUIRED` header**: Every 402 response now includes a base64-encoded `PAYMENT-REQUIRED` header with the full v2 PaymentRequired payload. Required by agentic.market's Bazaar validator.
- **`declareDiscoveryExtension` Bazaar reshaping**: Extension config is reshaped into CDP Bazaar's `info.input` / `info.output` structure before embedding in the `PAYMENT-REQUIRED` header.
- **CDP Facilitator routing**: When `PAYMENT-SIGNATURE` header is present (x402 v2 client), settlement routes to `api.cdp.coinbase.com/platform/v2/x402/settle` instead of Delegare's facilitator. This triggers Bazaar indexing.

## [0.1.0] - Initial Release

### Added
- **@delegare/sdk**: Initial release of the TypeScript SDK for merchants. Includes support for intent mandate validation, charging, and the x402 middleware.
- **@delegare/mcp-tools**: Initial release of the Model Context Protocol tools, enabling LLMs to execute payments autonomously.
- **Express Checkout Example**: Full end-to-end example demonstrating how to integrate Delegare into a Node.js/Express backend.
- **Hosted Setup UI**: Sandbox dashboard for merchant registration and user intent mandate generation.
- **Documentation**: Comprehensive guides covering concepts, API references, security models, and quickstarts.
