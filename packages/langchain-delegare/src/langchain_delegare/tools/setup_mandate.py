from typing import Any

from delegare import SetupDelegateRequest
from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from pydantic import BaseModel, ConfigDict, Field

from ._base import DelegareToolBase


class SetupMandateInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    max_per_tx_cents: int = Field(
        alias="maxPerTxCents", description="Maximum charge per transaction in cents"
    )
    max_monthly_spend_cents: int = Field(
        alias="maxMonthlySpendCents",
        description="Maximum total spend per month in cents",
    )
    rail: str | None = Field(
        default="both", description="Which payment rails to enable. Defaults to both."
    )
    rail_preference: str | None = Field(
        default="auto",
        alias="railPreference",
        description="How to select the rail when both are available. Defaults to auto.",
    )


class SetupMandateTool(DelegareToolBase):
    name: str = "setup_spending_mandate"
    description: str = "Initiate the one-time browser setup flow so the user can connect their payment method and set spending limits. Returns a URL the user must visit. Returns sessionToken for polling."
    args_schema: type[BaseModel] = SetupMandateInput

    def _run(
        self,
        max_per_tx_cents: int,
        max_monthly_spend_cents: int,
        rail: str = "both",
        rail_preference: str = "auto",
        run_manager: CallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = self.sync_client.create_setup_session(
            SetupDelegateRequest(
                maxMonthlySpendCents=max_monthly_spend_cents,
                maxPerTxCents=max_per_tx_cents,
                rail=rail,  # type: ignore
                railPreference=rail_preference,  # type: ignore
            )
        )

        return {
            "message": "Please ask the user to visit the setup URL to connect their payment method. This is a one-time step. The setup URL expires in 10 minutes. Use poll_setup_session with the sessionToken to check when setup is complete.",
            "setupUrl": res.setup_url,
            "sessionToken": res.session_token,
            "expiresInSeconds": res.expires_in_seconds,
        }

    async def _arun(
        self,
        max_per_tx_cents: int,
        max_monthly_spend_cents: int,
        rail: str = "both",
        rail_preference: str = "auto",
        run_manager: AsyncCallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = await self.async_client.create_setup_session(
            SetupDelegateRequest(
                maxMonthlySpendCents=max_monthly_spend_cents,
                maxPerTxCents=max_per_tx_cents,
                rail=rail,  # type: ignore
                railPreference=rail_preference,  # type: ignore
            )
        )

        return {
            "message": "Please ask the user to visit the setup URL to connect their payment method. This is a one-time step. The setup URL expires in 10 minutes. Use poll_setup_session with the sessionToken to check when setup is complete.",
            "setupUrl": res.setup_url,
            "sessionToken": res.session_token,
            "expiresInSeconds": res.expires_in_seconds,
        }
