import asyncio
import inspect
import threading
import time
from importlib.metadata import PackageNotFoundError, version
from typing import Any

import httpx

from .auth import ApiKeyAuth, DelegareConfig, OAuthAuth
from .exceptions import (
    AuthenticationError,
    BudgetExceededError,
    DelegareError,
    MandateNotFoundError,
    MandateRevokedError,
)

try:
    __version__ = version("delegare")
except PackageNotFoundError:
    __version__ = "unknown"


class HttpTransport:
    def __init__(self, config: DelegareConfig, timeout_sec: float = 30.0) -> None:
        self.config = config
        self.timeout_sec = timeout_sec

        headers = {"User-Agent": f"delegare-python/{__version__} (httpx/{httpx.__version__})"}
        if isinstance(config, ApiKeyAuth):
            headers["X-Delegare-Api-Key"] = config.api_key
            headers["X-Delegare-Merchant-Id"] = config.merchant_id
        elif isinstance(config, OAuthAuth):
            headers["Authorization"] = f"Bearer {config.access_token}"

        self.headers = headers
        self._sync_client: httpx.Client | None = None
        self._async_client: httpx.AsyncClient | None = None

        self._sync_lock = threading.Lock()
        self._async_lock = asyncio.Lock()
        # Keep track of when we last refreshed so concurrent requests don't all refresh
        self._last_refresh_time = 0.0

    @property
    def sync_client(self) -> httpx.Client:
        if self._sync_client is None:
            self._sync_client = httpx.Client(
                base_url=self.config.base_url,
                headers=self.headers,
                timeout=self.timeout_sec,
            )
        return self._sync_client

    @property
    def async_client(self) -> httpx.AsyncClient:
        if self._async_client is None:
            self._async_client = httpx.AsyncClient(
                base_url=self.config.base_url,
                headers=self.headers,
                timeout=self.timeout_sec,
            )
        return self._async_client

    def close(self) -> None:
        if self._sync_client is not None:
            self._sync_client.close()
            self._sync_client = None

    async def aclose(self) -> None:
        if self._async_client is not None:
            await self._async_client.aclose()
            self._async_client = None

    def _handle_error(self, response: httpx.Response) -> None:
        if response.status_code >= 400:
            msg = f"API Error {response.status_code}: {response.text}"
            if response.status_code == 401:
                raise AuthenticationError(msg, response=response)
            elif response.status_code == 404:
                raise MandateNotFoundError(msg, response=response)
            elif response.status_code in (409, 410):
                raise MandateRevokedError(msg, response=response)
            elif response.status_code == 402:
                raise BudgetExceededError(msg, response=response)
            raise DelegareError(msg, response=response)

    def _sync_refresh_token(self) -> bool:
        if not isinstance(self.config, OAuthAuth) or not self.config.refresh_token:
            return False

        with self._sync_lock:
            # If refreshed by another thread in the last 5 seconds, just return
            if time.time() - self._last_refresh_time < 5.0:
                self.sync_client.headers["Authorization"] = f"Bearer {self.config.access_token}"
                return True

            try:
                # Assuming standard OAuth2 token refresh endpoint
                resp = self.sync_client.post(
                    "/oauth2/token",
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": self.config.refresh_token,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                self.config.access_token = data["access_token"]
                if "refresh_token" in data:
                    self.config.refresh_token = data["refresh_token"]

                self.sync_client.headers["Authorization"] = f"Bearer {self.config.access_token}"
                self._last_refresh_time = time.time()

                # Call the optional callback
                if self.config.on_token_refresh:
                    # In sync context, we just call it. If it returns a coroutine, we can't await it easily here.

                    if not inspect.iscoroutinefunction(self.config.on_token_refresh):
                        self.config.on_token_refresh(self.config.access_token, self.config.refresh_token)

                return True
            except Exception:
                return False

    async def _async_refresh_token(self) -> bool:
        if not isinstance(self.config, OAuthAuth) or not self.config.refresh_token:
            return False

        async with self._async_lock:
            if time.time() - self._last_refresh_time < 5.0:
                self.async_client.headers["Authorization"] = f"Bearer {self.config.access_token}"
                return True

            try:
                resp = await self.async_client.post(
                    "/oauth2/token",
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": self.config.refresh_token,
                    },
                )
                resp.raise_for_status()
                data = resp.json()
                self.config.access_token = data["access_token"]
                if "refresh_token" in data:
                    self.config.refresh_token = data["refresh_token"]

                self.async_client.headers["Authorization"] = f"Bearer {self.config.access_token}"
                self._last_refresh_time = time.time()

                if self.config.on_token_refresh:
                    if inspect.iscoroutinefunction(self.config.on_token_refresh):
                        await self.config.on_token_refresh(self.config.access_token, self.config.refresh_token)
                    else:
                        self.config.on_token_refresh(self.config.access_token, self.config.refresh_token)

                return True
            except Exception:
                return False

    def request(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        attempts = 0
        while attempts < 3:
            response = self.sync_client.request(method, path, **kwargs)
            if response.status_code >= 500:
                attempts += 1
                if attempts < 3:
                    time.sleep(0.5 * (2 ** (attempts - 1)))
                    continue
            elif response.status_code == 401 and isinstance(self.config, OAuthAuth):
                if self._sync_refresh_token():
                    # Retry once
                    response = self.sync_client.request(method, path, **kwargs)

            self._handle_error(response)
            return response
        # Unreachable
        raise DelegareError("Max retries exceeded for 5xx errors")

    async def arequest(self, method: str, path: str, **kwargs: Any) -> httpx.Response:
        attempts = 0
        while attempts < 3:
            response = await self.async_client.request(method, path, **kwargs)
            if response.status_code >= 500:
                attempts += 1
                if attempts < 3:
                    await asyncio.sleep(0.5 * (2 ** (attempts - 1)))
                    continue
            elif response.status_code == 401 and isinstance(self.config, OAuthAuth):
                if await self._async_refresh_token():
                    response = await self.async_client.request(method, path, **kwargs)

            self._handle_error(response)
            return response
        raise DelegareError("Max retries exceeded for 5xx errors")
