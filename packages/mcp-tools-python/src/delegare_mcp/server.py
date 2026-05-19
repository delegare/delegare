import argparse
import asyncio
import os

import mcp.server.stdio
from mcp.server import Server

from delegare_mcp.tools import RegisterDelegareToolsOptions, register_delegare_tools


async def main() -> None:
    parser = argparse.ArgumentParser(description="Delegare MCP Server")
    parser.add_argument(
        "--api-url",
        default=os.environ.get("API_BASE_URL", "https://api.delegare.dev/v1"),
        help="API Base URL",
    )
    parser.add_argument(
        "--api-key",
        default=os.environ.get("DELEGARE_API_KEY", ""),
        help="Delegare API Key",
    )
    parser.add_argument(
        "--merchant-id",
        default=os.environ.get("DELEGARE_MERCHANT_ID", "mcp-desktop-client"),
        help="Delegare Merchant ID",
    )
    args = parser.parse_args()

    server = Server("delegare-mcp")

    options = RegisterDelegareToolsOptions(
        merchant_id=args.merchant_id,
        api_key=args.api_key,
        base_url=args.api_url,
    )
    register_delegare_tools(server, options)

    # Run on stdio
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())


def run() -> None:
    asyncio.run(main())
