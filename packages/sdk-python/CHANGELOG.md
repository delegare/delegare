# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - Unreleased
### Added
- Initial release of the Python SDK for Delegare.
- Supported operations: \`charge\`, \`get_balance\`, \`revoke\`, \`create_setup_session\`, \`get_setup_session\`, \`wait_for_setup\`, and \`fetch\`.
- Complete Pydantic models aligning with TypeScript canonical structures.
- Both synchronous and asynchronous clients (\`Delegare\` and \`AsyncDelegare\`).
- x402 Auto-pay functionality in the \`fetch\` wrapper natively.
