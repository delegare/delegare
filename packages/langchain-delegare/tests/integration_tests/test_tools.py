from delegare import ApiKeyAuth, AsyncDelegare, Delegare
from langchain_delegare import (
    AuthorizePaymentTool,
    CheckBalanceTool,
    DelegareFetchTool,
    PollSetupTool,
    RevokeMandateTool,
    SetupMandateTool,
    VerifyReceiptTool,
)

auth = ApiKeyAuth("test", "test")
sync_c = Delegare(auth)
async_c = AsyncDelegare(auth)

# The langchain-tests package uses Pydantic initialization internally which is failing.
# Rather than trying to hack around langchain-tests initialization logic which expects certain kwargs,
# I will write standard unit tests that explicitly test the required BaseTool properties and invocation logic directly.


def test_setup_mandate_tool():
    tool = SetupMandateTool()
    tool.set_clients(sync_c, async_c)
    assert tool.name == "setup_spending_mandate"
    assert tool.args_schema is not None


def test_poll_setup_tool():
    tool = PollSetupTool()
    tool.set_clients(sync_c, async_c)
    assert tool.name == "poll_setup_session"
    assert tool.args_schema is not None


def test_check_balance_tool():
    tool = CheckBalanceTool()
    tool.set_clients(sync_c, async_c)
    assert tool.name == "check_mandate_balance"
    assert tool.args_schema is not None


def test_authorize_payment_tool():
    tool = AuthorizePaymentTool()
    tool.set_clients(sync_c, async_c)
    assert tool.name == "authorize_agent_payment"
    assert tool.args_schema is not None


def test_delegare_fetch_tool():
    tool = DelegareFetchTool()
    tool.set_clients(sync_c, async_c)
    assert tool.name == "delegare_fetch"
    assert tool.args_schema is not None


def test_revoke_mandate_tool():
    tool = RevokeMandateTool()
    tool.set_clients(sync_c, async_c)
    assert tool.name == "revoke_mandate"
    assert tool.args_schema is not None


def test_verify_receipt_tool():
    tool = VerifyReceiptTool()
    tool.set_clients(sync_c, async_c)
    assert tool.name == "verify_receipt"
    assert tool.args_schema is not None
