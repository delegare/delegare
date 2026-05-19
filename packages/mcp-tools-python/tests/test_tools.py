import pytest
from delegare_mcp.tools import RegisterDelegareToolsOptions, register_delegare_tools
from mcp.server import Server


@pytest.fixture
def server():
    return Server("test-server")


def test_register_tools_no_crash(server):
    options = RegisterDelegareToolsOptions(merchant_id="test", api_key="test")
    # Just verify it doesn't crash during registration
    register_delegare_tools(server, options)


def test_schemas():
    from delegare_mcp.schemas import AuthorizePaymentSchema
    from pydantic import ValidationError

    with pytest.raises(ValidationError):
        AuthorizePaymentSchema(intentMandate="m", amountCents=-10, currency="usd", description="d", idempotencyKey="i")
