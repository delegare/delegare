import pytest
from delegare import Delegare, AsyncDelegare, ApiKeyAuth, ChargeRequest, SetupDelegateRequest, DelegareError
import httpx
import time

def test_sync_charge(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/payments/charge",
        method="POST",
        json={
            "receiptId": "ch_123",
            "status": "completed",
            "amountCents": 1000,
            "currency": "usd",
            "railUsed": "fiat"
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        req = ChargeRequest(
            amountCents=1000,
            currency="usd",
            idempotencyKey="idem_123",
            intentMandate="mandate_123",
        )
        res = client.charge(req)

    assert res.receipt_id == "ch_123"
    assert res.status == "completed"
    assert res.amount_cents == 1000

@pytest.mark.asyncio
async def test_async_charge(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/payments/charge",
        method="POST",
        json={
            "receiptId": "ch_123",
            "status": "completed",
            "amountCents": 1000,
            "currency": "usd",
            "railUsed": "fiat"
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        req = ChargeRequest(
            amountCents=1000,
            currency="usd",
            idempotencyKey="idem_123",
            intentMandate="mandate_123",
        )
        res = await client.charge(req)

    assert res.receipt_id == "ch_123"

def test_get_balance(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123/balance",
        method="GET",
        json={
            "mandateId": "mandate_123",
            "status": "active",
            "monthlyLimitCents": 5000,
            "remainingMonthlyBudgetCents": 4000,
            "paymentMethods": [],
            "railPreference": "auto",
            "spentByRail": {
                "fiat": {"spentCents": 1000, "transactions": 1},
                "crypto": {"spentCents": 0, "transactions": 0}
            }
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.get_balance("mandate_123")

    assert res.status == "active"
    assert res.remaining_monthly_budget_cents == 4000

def test_revoke(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123",
        method="DELETE",
        json={
            "success": True,
            "revokedAt": "2026-05-15T12:00:00Z"
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.revoke("mandate_123")

    assert res.success is True

def test_create_setup_session(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates",
        method="POST",
        json={
            "setupUrl": "https://setup.delegare.dev/123",
            "sessionToken": "token_123",
            "expiresInSeconds": 3600
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.create_setup_session(SetupDelegateRequest(
            maxMonthlySpendCents=5000,
            maxPerTxCents=1000,
            railPreference="auto"
        ))

    assert res.session_token == "token_123"

def test_fetch_happy_path(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.example.com/data",
        method="GET",
        json={"data": "success"},
        status_code=200
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.fetch("https://api.example.com/data", intent_mandate="mandate_123")

    assert res.json() == {"data": "success"}

def test_5xx_retry(httpx_mock, mock_merchant_id, mock_api_key):
    # Setup 2 failures then success
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123/balance", method="GET", status_code=500)
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123/balance", method="GET", status_code=502)
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123/balance",
        method="GET",
        json={
            "mandateId": "mandate_123",
            "status": "active",
            "monthlyLimitCents": 5000,
            "remainingMonthlyBudgetCents": 4000,
            "paymentMethods": [],
            "railPreference": "auto",
            "spentByRail": {
                "fiat": {"spentCents": 1000, "transactions": 1},
                "crypto": {"spentCents": 0, "transactions": 0}
            }
        },
        status_code=200
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.get_balance("mandate_123")

    assert res.remaining_monthly_budget_cents == 4000


@pytest.mark.asyncio
async def test_async_get_balance(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123/balance",
        method="GET",
        json={
            "mandateId": "mandate_123",
            "status": "active",
            "monthlyLimitCents": 5000,
            "remainingMonthlyBudgetCents": 4000,
            "paymentMethods": [],
            "railPreference": "auto",
            "spentByRail": {
                "fiat": {"spentCents": 1000, "transactions": 1},
                "crypto": {"spentCents": 0, "transactions": 0}
            }
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.get_balance("mandate_123")

    assert res.status == "active"
    assert res.remaining_monthly_budget_cents == 4000

@pytest.mark.asyncio
async def test_async_revoke(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123",
        method="DELETE",
        json={
            "success": True,
            "revokedAt": "2026-05-15T12:00:00Z"
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.revoke("mandate_123")

    assert res.success is True

@pytest.mark.asyncio
async def test_async_create_setup_session(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates",
        method="POST",
        json={
            "setupUrl": "https://setup.delegare.dev/123",
            "sessionToken": "token_123",
            "expiresInSeconds": 3600
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.create_setup_session(SetupDelegateRequest(
            maxMonthlySpendCents=5000,
            maxPerTxCents=1000,
            railPreference="auto"
        ))

    assert res.session_token == "token_123"

@pytest.mark.asyncio
async def test_async_fetch_happy_path(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.example.com/data",
        method="GET",
        json={"data": "success"},
        status_code=200
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.fetch("https://api.example.com/data", intent_mandate="mandate_123")

    assert res.json() == {"data": "success"}

@pytest.mark.asyncio
async def test_async_5xx_retry(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123/balance", method="GET", status_code=500)
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123/balance", method="GET", status_code=502)
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123/balance",
        method="GET",
        json={
            "mandateId": "mandate_123",
            "status": "active",
            "monthlyLimitCents": 5000,
            "remainingMonthlyBudgetCents": 4000,
            "paymentMethods": [],
            "railPreference": "auto",
            "spentByRail": {
                "fiat": {"spentCents": 1000, "transactions": 1},
                "crypto": {"spentCents": 0, "transactions": 0}
            }
        },
        status_code=200
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.get_balance("mandate_123")

    assert res.remaining_monthly_budget_cents == 4000


def test_wait_for_setup(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/setup-sessions/token_123",
        method="GET",
        json={
            "sessionToken": "token_123",
            "status": "pending"
        }
    )
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/setup-sessions/token_123",
        method="GET",
        json={
            "sessionToken": "token_123",
            "status": "complete",
            "intentMandate": "mandate_123"
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.wait_for_setup("token_123", timeout_sec=2.0)

    assert res == "mandate_123"

@pytest.mark.asyncio
async def test_async_wait_for_setup(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/setup-sessions/token_123",
        method="GET",
        json={
            "sessionToken": "token_123",
            "status": "pending"
        }
    )
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/setup-sessions/token_123",
        method="GET",
        json={
            "sessionToken": "token_123",
            "status": "complete",
            "intentMandate": "mandate_123"
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.wait_for_setup("token_123", timeout_sec=2.0)

    assert res == "mandate_123"

def test_fetch_x402(httpx_mock, mock_merchant_id, mock_api_key):
    # Initial 402
    httpx_mock.add_response(
        url="https://api.example.com/data",
        method="GET",
        json={
            "accepts": [{
                "scheme": "exact",
                "network": "base",
                "asset": "usdc",
                "maxAmountRequired": "1000",
                "payTo": "0x123",
                "resource": "data"
            }]
        },
        status_code=402
    )

    # The retry response
    httpx_mock.add_response(
        url="https://api.example.com/data",
        method="GET",
        json={"data": "success"},
        status_code=200
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.fetch("https://api.example.com/data", intent_mandate="mandate_123")

    assert res.json() == {"data": "success"}
    
@pytest.mark.asyncio
async def test_async_fetch_x402(httpx_mock, mock_merchant_id, mock_api_key):
    # Initial 402
    httpx_mock.add_response(
        url="https://api.example.com/data",
        method="GET",
        json={
            "accepts": [{
                "scheme": "exact",
                "network": "base",
                "asset": "usdc",
                "maxAmountRequired": "1000",
                "payTo": "0x123",
                "resource": "data"
            }]
        },
        status_code=402
    )

    # The retry response
    httpx_mock.add_response(
        url="https://api.example.com/data",
        method="GET",
        json={"data": "success"},
        status_code=200
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.fetch("https://api.example.com/data", intent_mandate="mandate_123")

    assert res.json() == {"data": "success"}

def test_auth_error(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123/balance",
        method="GET",
        json={"error": "unauthorized"},
        status_code=401
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with pytest.raises(DelegareError):
        with Delegare(auth) as client:
            client.get_balance("mandate_123")


def test_sync_get_setup_session(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/setup-sessions/token_123",
        method="GET",
        json={
            "sessionToken": "token_123",
            "status": "pending"
        }
    )
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.get_setup_session("token_123")
    assert res.session_token == "token_123"

def test_sync_revoke(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123",
        method="DELETE",
        json={
            "success": True,
            "revokedAt": "2026-05-15T12:00:00Z"
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.revoke("mandate_123")

    assert res.success is True
    
def test_sync_create_setup_session(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates",
        method="POST",
        json={
            "setupUrl": "https://setup.delegare.dev/123",
            "sessionToken": "token_123",
            "expiresInSeconds": 3600
        }
    )

    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        from delegare import SetupDelegateRequest
        res = client.create_setup_session(SetupDelegateRequest(
            maxMonthlySpendCents=5000,
            maxPerTxCents=1000,
            railPreference="auto"
        ))

    assert res.session_token == "token_123"

@pytest.mark.asyncio
async def test_async_get_setup_session(httpx_mock, mock_merchant_id, mock_api_key):
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/setup-sessions/token_123",
        method="GET",
        json={
            "sessionToken": "token_123",
            "status": "pending"
        }
    )
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.get_setup_session("token_123")
    assert res.session_token == "token_123"
    
def test_oauth_refresh_sync(httpx_mock):
    # Initial 401
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123/balance", method="GET", status_code=401)
    # Refresh success
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/oauth2/token",
        method="POST",
        json={
            "access_token": "new_access",
            "refresh_token": "new_refresh"
        }
    )
    # Retry success
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123/balance",
        method="GET",
        json={
            "mandateId": "mandate_123",
            "status": "active",
            "monthlyLimitCents": 5000,
            "remainingMonthlyBudgetCents": 4000,
            "paymentMethods": [],
            "railPreference": "auto",
            "spentByRail": {
                "fiat": {"spentCents": 1000, "transactions": 1},
                "crypto": {"spentCents": 0, "transactions": 0}
            }
        },
        status_code=200
    )

    from delegare import OAuthAuth, Delegare
    
    auth = OAuthAuth(access_token="old_access", refresh_token="old_refresh")
    with Delegare(auth) as client:
        res = client.get_balance("mandate_123")
        assert res.status == "active"
        assert auth.access_token == "new_access"

@pytest.mark.asyncio
async def test_oauth_refresh_async(httpx_mock):
    # Initial 401
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123/balance", method="GET", status_code=401)
    # Refresh success
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/oauth2/token",
        method="POST",
        json={
            "access_token": "new_access",
            "refresh_token": "new_refresh"
        }
    )
    # Retry success
    httpx_mock.add_response(
        url="https://api.delegare.dev/v1/mandates/mandate_123/balance",
        method="GET",
        json={
            "mandateId": "mandate_123",
            "status": "active",
            "monthlyLimitCents": 5000,
            "remainingMonthlyBudgetCents": 4000,
            "paymentMethods": [],
            "railPreference": "auto",
            "spentByRail": {
                "fiat": {"spentCents": 1000, "transactions": 1},
                "crypto": {"spentCents": 0, "transactions": 0}
            }
        },
        status_code=200
    )

    from delegare import OAuthAuth, AsyncDelegare
    
    auth = OAuthAuth(access_token="old_access", refresh_token="old_refresh")
    async with AsyncDelegare(auth) as client:
        res = await client.get_balance("mandate_123")
        assert res.status == "active"
        assert auth.access_token == "new_access"


def test_parse_x402_requirements_list():
    from delegare import parse_x402_requirements
    
    payload = """[
        {
            "scheme": "exact",
            "network": "base",
            "asset": "usdc",
            "maxAmountRequired": "1000",
            "payTo": "0x123",
            "resource": "data"
        }
    ]"""
    res = parse_x402_requirements(payload)
    assert len(res) == 1

def test_parse_x402_requirements_invalid():
    from delegare import parse_x402_requirements
    res = parse_x402_requirements("not json")
    assert len(res) == 0
    res2 = parse_x402_requirements('{"other": 1}')
    assert len(res2) == 0

def test_decode_payment_receipt_invalid():
    from delegare import decode_payment_receipt
    import httpx
    import pytest
    from delegare import X402Error
    
    with pytest.raises(X402Error):
        decode_payment_receipt(httpx.Response(200)) # Missing header

def test_handle_error_404(httpx_mock, mock_merchant_id, mock_api_key):
    from delegare import MandateNotFoundError
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123", method="DELETE", status_code=404)
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with pytest.raises(MandateNotFoundError):
        with Delegare(auth) as client:
            client.revoke("mandate_123")

def test_handle_error_409(httpx_mock, mock_merchant_id, mock_api_key):
    from delegare import MandateRevokedError
    httpx_mock.add_response(url="https://api.delegare.dev/v1/mandates/mandate_123/balance", method="GET", status_code=409)
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with pytest.raises(MandateRevokedError):
        with Delegare(auth) as client:
            client.get_balance("mandate_123")

def test_handle_error_402(httpx_mock, mock_merchant_id, mock_api_key):
    from delegare import BudgetExceededError
    httpx_mock.add_response(url="https://api.delegare.dev/v1/payments/charge", method="POST", status_code=402)
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with pytest.raises(BudgetExceededError):
        with Delegare(auth) as client:
            client.charge(ChargeRequest(amountCents=1000, currency="usd", idempotencyKey="idem", intentMandate="m"))


@pytest.mark.asyncio
async def test_handle_error_5xx_retry_fails(httpx_mock, mock_merchant_id, mock_api_key):
    from delegare import DelegareError
    httpx_mock.add_response(url="https://api.delegare.dev/v1/payments/charge", method="POST", status_code=500)
    httpx_mock.add_response(url="https://api.delegare.dev/v1/payments/charge", method="POST", status_code=502)
    httpx_mock.add_response(url="https://api.delegare.dev/v1/payments/charge", method="POST", status_code=503)
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with pytest.raises(DelegareError, match="API Error 503"):
        async with AsyncDelegare(auth) as client:
            await client.charge(ChargeRequest(amountCents=1000, currency="usd", idempotencyKey="idem", intentMandate="m"))

def test_handle_error_5xx_retry_fails_sync(httpx_mock, mock_merchant_id, mock_api_key):
    from delegare import DelegareError
    httpx_mock.add_response(url="https://api.delegare.dev/v1/payments/charge", method="POST", status_code=500)
    httpx_mock.add_response(url="https://api.delegare.dev/v1/payments/charge", method="POST", status_code=502)
    httpx_mock.add_response(url="https://api.delegare.dev/v1/payments/charge", method="POST", status_code=503)
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with pytest.raises(DelegareError, match="API Error 503"):
        with Delegare(auth) as client:
            client.charge(ChargeRequest(amountCents=1000, currency="usd", idempotencyKey="idem", intentMandate="m"))

@pytest.mark.asyncio
async def test_fetch_auth_error_async(httpx_mock, mock_merchant_id, mock_api_key):
    from delegare import AuthenticationError
    httpx_mock.add_response(url="https://api.example.com/data", method="GET", status_code=401)
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    async with AsyncDelegare(auth) as client:
        res = await client.fetch("https://api.example.com/data")
        assert res.status_code == 401

def test_fetch_auth_error_sync(httpx_mock, mock_merchant_id, mock_api_key):
    from delegare import AuthenticationError
    httpx_mock.add_response(url="https://api.example.com/data", method="GET", status_code=401)
    auth = ApiKeyAuth(merchant_id=mock_merchant_id, api_key=mock_api_key)
    with Delegare(auth) as client:
        res = client.fetch("https://api.example.com/data")
        assert res.status_code == 401
            
def test_oauth_is_config():
    from delegare import is_oauth_config, OAuthAuth, ApiKeyAuth
    assert is_oauth_config(OAuthAuth("test", "test")) is True
    assert is_oauth_config(ApiKeyAuth("test", "test")) is False
