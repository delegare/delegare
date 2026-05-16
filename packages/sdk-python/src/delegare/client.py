import asyncio
import time
from typing import Any

from ._http import HttpTransport
from .auth import DelegareConfig
from .exceptions import SetupTimeoutError
from .models import (
    BalanceResponse,
    ChargeRequest,
    ChargeResponse,
    RevokeResponse,
    SetupDelegateRequest,
    SetupDelegateResponse,
    SetupSessionStatus,
)


class Delegare:
    """Delegare Sync Client."""

    def __init__(self, config: DelegareConfig, timeout_sec: float = 30.0) -> None:
        self.config = config
        self._transport = HttpTransport(config, timeout_sec)

    def close(self) -> None:
        self._transport.close()

    def __enter__(self) -> "Delegare":
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        self.close()

    def charge(self, request: ChargeRequest) -> ChargeResponse:
        """Process a payment charge against a delegate mandate."""
        payload = request.model_dump(by_alias=True, exclude_none=True)
        response = self._transport.request("POST", "/payments/charge", json=payload)
        return ChargeResponse.model_validate(response.json())

    def get_balance(self, intent_mandate: str) -> BalanceResponse:
        """Get the current balance and limits for a specific spending mandate."""
        response = self._transport.request("GET", f"/mandates/{intent_mandate}/balance")
        return BalanceResponse.model_validate(response.json())

    def revoke(self, intent_mandate: str) -> RevokeResponse:
        """Revoke a spending mandate."""
        response = self._transport.request("DELETE", f"/mandates/{intent_mandate}")
        return RevokeResponse.model_validate(response.json())

    def create_setup_session(
        self, request: SetupDelegateRequest
    ) -> SetupDelegateResponse:
        """Create a session for the user to securely set up their payment method and spending limits."""
        payload = request.model_dump(by_alias=True, exclude_none=True)
        response = self._transport.request("POST", "/mandates", json=payload)
        return SetupDelegateResponse.model_validate(response.json())

    def get_setup_session(self, session_token: str) -> SetupSessionStatus:
        """Get the current status of a setup session."""
        response = self._transport.request("GET", f"/setup-sessions/{session_token}")
        return SetupSessionStatus.model_validate(response.json())

    def wait_for_setup(self, session_token: str, timeout_sec: float = 300.0) -> str:
        """Block until the setup session is successfully completed, expires, or times out."""
        start_time = time.time()
        while time.time() - start_time < timeout_sec:
            status = self.get_setup_session(session_token)
            if status.status == "complete" and status.intent_mandate:
                return status.intent_mandate
            if status.status == "expired":
                raise SetupTimeoutError(f"Setup session {session_token} expired")
            time.sleep(1.0)
        raise SetupTimeoutError(
            f"Setup session {session_token} did not complete within {timeout_sec} seconds"
        )

    def fetch(self, url: str, intent_mandate: str | None = None, **init: Any) -> Any:
        """x402 auto-pay fetch wrapper. Executes a request, pays if x402 required, and retries."""

        method = init.pop("method", "GET")
        if "intent_mandate" in init:
            del init["intent_mandate"]
        first = self._transport.sync_client.request(method, url, **init)
        if first.status_code != 402 or not intent_mandate:
            return first
        try:
            accepts = first.json().get("accepts", [])
        except Exception:
            return first
        req = next(
            (
                a
                for a in accepts
                if a.get("scheme") == "exact"
                and a.get("network") in ("base", "base-sepolia")
            ),
            None,
        )
        if not req:
            return first
        headers = {**init.get("headers", {}), "X-DELEGARE-MANDATE": intent_mandate}
        init["headers"] = headers
        return self._transport.sync_client.request(method, url, **init)


class AsyncDelegare:
    """Delegare Async Client."""

    def __init__(self, config: DelegareConfig, timeout_sec: float = 30.0) -> None:
        self.config = config
        self._transport = HttpTransport(config, timeout_sec)

    async def aclose(self) -> None:
        await self._transport.aclose()

    async def __aenter__(self) -> "AsyncDelegare":
        return self

    async def __aexit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        await self.aclose()

    async def charge(self, request: ChargeRequest) -> ChargeResponse:
        """Process a payment charge against a delegate mandate."""
        payload = request.model_dump(by_alias=True, exclude_none=True)
        response = await self._transport.arequest(
            "POST", "/payments/charge", json=payload
        )
        return ChargeResponse.model_validate(response.json())

    async def get_balance(self, intent_mandate: str) -> BalanceResponse:
        """Get the current balance and limits for a specific spending mandate."""
        response = await self._transport.arequest(
            "GET", f"/mandates/{intent_mandate}/balance"
        )
        return BalanceResponse.model_validate(response.json())

    async def revoke(self, intent_mandate: str) -> RevokeResponse:
        """Revoke a spending mandate."""
        response = await self._transport.arequest(
            "DELETE", f"/mandates/{intent_mandate}"
        )
        return RevokeResponse.model_validate(response.json())

    async def create_setup_session(
        self, request: SetupDelegateRequest
    ) -> SetupDelegateResponse:
        """Create a session for the user to securely set up their payment method and spending limits."""
        payload = request.model_dump(by_alias=True, exclude_none=True)
        response = await self._transport.arequest("POST", "/mandates", json=payload)
        return SetupDelegateResponse.model_validate(response.json())

    async def get_setup_session(self, session_token: str) -> SetupSessionStatus:
        """Get the current status of a setup session."""
        response = await self._transport.arequest(
            "GET", f"/setup-sessions/{session_token}"
        )
        return SetupSessionStatus.model_validate(response.json())

    async def wait_for_setup(
        self, session_token: str, timeout_sec: float = 300.0
    ) -> str:
        """Block until the setup session is successfully completed, expires, or times out."""
        start_time = time.time()
        while time.time() - start_time < timeout_sec:
            status = await self.get_setup_session(session_token)
            if status.status == "complete" and status.intent_mandate:
                return status.intent_mandate
            if status.status == "expired":
                raise SetupTimeoutError(f"Setup session {session_token} expired")
            await asyncio.sleep(1.0)
        raise SetupTimeoutError(
            f"Setup session {session_token} did not complete within {timeout_sec} seconds"
        )

    async def fetch(
        self, url: str, intent_mandate: str | None = None, **init: Any
    ) -> Any:

        method = init.pop("method", "GET")
        if "intent_mandate" in init:
            del init["intent_mandate"]
        first = await self._transport.async_client.request(method, url, **init)
        if first.status_code != 402 or not intent_mandate:
            return first
        try:
            accepts = first.json().get("accepts", [])
        except Exception:
            return first
        req = next(
            (
                a
                for a in accepts
                if a.get("scheme") == "exact"
                and a.get("network") in ("base", "base-sepolia")
            ),
            None,
        )
        if not req:
            return first
        headers = {**init.get("headers", {}), "X-DELEGARE-MANDATE": intent_mandate}
        init["headers"] = headers
        return await self._transport.async_client.request(method, url, **init)
