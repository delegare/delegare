from typing import Any

from delegare import ApiKeyAuth, AsyncDelegare, Delegare, OAuthAuth
from langchain_core.tools import BaseTool
from langchain_core.tools.base import BaseToolkit
from pydantic import ConfigDict, Field

from .tools import (
    AuthorizePaymentTool,
    CheckBalanceTool,
    DelegareFetchTool,
    PollSetupTool,
    RevokeMandateTool,
    SetupMandateTool,
    VerifyReceiptTool,
)


class DelegareToolkit(BaseToolkit):
    """Toolkit for Delegare operations."""

    model_config = ConfigDict(arbitrary_types_allowed=True)

    sync_client: Delegare
    async_client: AsyncDelegare
    allowed_amounts_cents: list[int] | None = Field(default=None)
    tool_filter: list[str] | None = Field(default=None)

    @classmethod
    def from_api_key(
        cls,
        merchant_id: str,
        api_key: str,
        base_url: str | None = None,
        allowed_amounts_cents: list[int] | None = None,
        tool_filter: list[str] | None = None,
    ) -> "DelegareToolkit":
        auth = ApiKeyAuth(merchant_id=merchant_id, api_key=api_key)
        if base_url:
            auth.base_url = base_url
        sync_client = Delegare(auth)
        async_client = AsyncDelegare(auth)
        return cls(
            sync_client=sync_client,
            async_client=async_client,
            allowed_amounts_cents=allowed_amounts_cents,
            tool_filter=tool_filter,
        )

    @classmethod
    def from_oauth(
        cls,
        access_token: str,
        refresh_token: str | None = None,
        on_token_refresh: Any = None,
        base_url: str | None = None,
        allowed_amounts_cents: list[int] | None = None,
        tool_filter: list[str] | None = None,
    ) -> "DelegareToolkit":
        auth = OAuthAuth(
            access_token=access_token,
            refresh_token=refresh_token,
            on_token_refresh=on_token_refresh,
        )
        if base_url:
            auth.base_url = base_url
        sync_client = Delegare(auth)
        async_client = AsyncDelegare(auth)
        return cls(
            sync_client=sync_client,
            async_client=async_client,
            allowed_amounts_cents=allowed_amounts_cents,
            tool_filter=tool_filter,
        )

    def get_tools(self) -> list[BaseTool]:
        tools: list[BaseTool] = [
            SetupMandateTool(
                sync_client=self.sync_client, async_client=self.async_client
            ),
            PollSetupTool(sync_client=self.sync_client, async_client=self.async_client),
            CheckBalanceTool(
                sync_client=self.sync_client, async_client=self.async_client
            ),
            AuthorizePaymentTool(
                sync_client=self.sync_client,
                async_client=self.async_client,
                allowed_amounts_cents=self.allowed_amounts_cents,
            ),
            DelegareFetchTool(
                sync_client=self.sync_client, async_client=self.async_client
            ),
            RevokeMandateTool(
                sync_client=self.sync_client, async_client=self.async_client
            ),
            VerifyReceiptTool(
                sync_client=self.sync_client, async_client=self.async_client
            ),
        ]

        if self.tool_filter:
            return [tool for tool in tools if tool.name in self.tool_filter]
        return tools
