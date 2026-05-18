import json
from typing import Any

from delegare import ChargeRequest
from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from pydantic import BaseModel, Field

from ._base import DelegareInputBase, DelegareToolBase


class AuthorizePaymentInput(DelegareInputBase):
    intent_mandate: str = Field(
        alias="intentMandate", description="The intentMandate stored in agent context"
    )
    amount_cents: int = Field(
        alias="amountCents",
        description="Amount in US cents (1/100th of a dollar). amountCents=50 = $0.50. amountCents=499 = $4.99. DO NOT display this as the dollar amount.",
    )
    currency: str = Field(
        description="Settlement currency (usdc = USDC stablecoin on Base). The dollar amount is amountCents / 100."
    )
    description: str = Field(
        description="Human-readable description of what is being paid for"
    )
    idempotency_key: str = Field(
        alias="idempotencyKey",
        description="Unique key to prevent duplicate charges. Use a stable identifier like a subscription ID.",
    )
    metadata_json: str | None = Field(
        default=None,
        alias="metadataJson",
        description="Optional JSON string of key-value metadata",
    )


class AuthorizePaymentTool(DelegareToolBase):
    name: str = "authorize_agent_payment"
    description: str = "Execute a payment through the Delegare vault using AP2. The agent presents its Intent Mandate (SD-JWT-VC). Spending limits are enforced server-side. IMPORTANT: amountCents is in US cents — divide by 100 for the dollar amount (e.g. amountCents=50 means $0.50, NOT 50 dollars or 50 USDC)."
    args_schema: type[BaseModel] = AuthorizePaymentInput

    allowed_amounts_cents: list[int] | None = None

    def __init__(
        self, allowed_amounts_cents: list[int] | None = None, **kwargs: Any
    ) -> None:
        if allowed_amounts_cents is not None:
            kwargs["allowed_amounts_cents"] = allowed_amounts_cents
        super().__init__(**kwargs)

    def _run(
        self,
        intent_mandate: str,
        amount_cents: int,
        currency: str,
        description: str,
        idempotency_key: str,
        metadata_json: str | None = None,
        run_manager: CallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        if (
            self.allowed_amounts_cents
            and amount_cents not in self.allowed_amounts_cents
        ):
            return {
                "error": "amount_not_allowed",
                "message": f"Amount {amount_cents} cents is not in the allowed amounts list",
                "allowedAmounts": self.allowed_amounts_cents,
            }

        metadata = None
        if metadata_json:
            try:
                metadata = json.loads(metadata_json)
            except Exception:
                pass

        receipt = self.sync_client.charge(
            ChargeRequest(
                intentMandate=intent_mandate,
                amountCents=amount_cents,
                currency=currency,  # type: ignore
                description=description,
                idempotencyKey=idempotency_key,
                metadata=metadata,
            )
        )

        usd_amount = f"{amount_cents / 100:.2f}"
        res_dict = receipt.model_dump(by_alias=True)
        res_dict["amountUsd"] = f"${usd_amount}"
        res_dict["note"] = (
            f"Payment of ${usd_amount} ({amount_cents} cents) processed via {currency.upper()} on Base."
        )

        return res_dict

    async def _arun(
        self,
        intent_mandate: str,
        amount_cents: int,
        currency: str,
        description: str,
        idempotency_key: str,
        metadata_json: str | None = None,
        run_manager: AsyncCallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        if (
            self.allowed_amounts_cents
            and amount_cents not in self.allowed_amounts_cents
        ):
            return {
                "error": "amount_not_allowed",
                "message": f"Amount {amount_cents} cents is not in the allowed amounts list",
                "allowedAmounts": self.allowed_amounts_cents,
            }

        metadata = None
        if metadata_json:
            try:
                metadata = json.loads(metadata_json)
            except Exception:
                pass

        receipt = await self.async_client.charge(
            ChargeRequest(
                intentMandate=intent_mandate,
                amountCents=amount_cents,
                currency=currency,  # type: ignore
                description=description,
                idempotencyKey=idempotency_key,
                metadata=metadata,
            )
        )

        usd_amount = f"{amount_cents / 100:.2f}"
        res_dict = receipt.model_dump(by_alias=True)
        res_dict["amountUsd"] = f"${usd_amount}"
        res_dict["note"] = (
            f"Payment of ${usd_amount} ({amount_cents} cents) processed via {currency.upper()} on Base."
        )

        return res_dict
