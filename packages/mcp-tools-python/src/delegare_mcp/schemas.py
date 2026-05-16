from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class BaseDelegareSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SetupSpendingMandateSchema(BaseDelegareSchema):
    max_per_tx_cents: int = Field(
        gt=0,
        alias="maxPerTxCents",
        description="Maximum charge per transaction in cents",
    )
    max_monthly_spend_cents: int = Field(
        gt=0,
        alias="maxMonthlySpendCents",
        description="Maximum total spend per month in cents",
    )
    rail: Literal["fiat", "crypto", "both"] | None = Field(
        default=None, description="Which payment rails to enable. Defaults to both."
    )
    rail_preference: (
        Literal["auto", "fiat_first", "crypto_first", "cheapest", "fastest"] | None
    ) = Field(
        default=None,
        alias="railPreference",
        description="How to select the rail when both are available. Defaults to auto.",
    )


class PollSetupSessionSchema(BaseDelegareSchema):
    session_token: str = Field(
        alias="sessionToken",
        description="The sessionToken returned by setup_spending_mandate",
    )


class CheckMandateBalanceSchema(BaseDelegareSchema):
    intent_mandate: str = Field(
        alias="intentMandate",
        description="The intentMandate (SD-JWT-VC) stored in agent context",
    )


class AuthorizePaymentSchema(BaseDelegareSchema):
    intent_mandate: str = Field(
        alias="intentMandate", description="The intentMandate stored in agent context"
    )
    amount_cents: int = Field(
        gt=0,
        alias="amountCents",
        description="Amount in US cents (1/100th of a dollar). amountCents=50 = $0.50. amountCents=499 = $4.99. DO NOT display this as the dollar amount.",
    )
    currency: Literal["usd", "usdc", "usdt"] = Field(
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
        description='Optional JSON string of key-value metadata (e.g. \'{"planId":"growth"}\')',
    )


class DelegareFetchSchema(BaseDelegareSchema):
    url: str = Field(description="The URL to fetch")
    method: Literal["GET", "POST"] = Field(default="GET", description="HTTP method")
    body: str | None = Field(
        default=None, description="Optional JSON body for POST requests"
    )
    intent_mandate: str = Field(
        alias="intentMandate",
        description="Your active spending delegate token (intentMandate)",
    )


class RevokeMandateSchema(BaseDelegareSchema):
    intent_mandate: str = Field(
        alias="intentMandate", description="The intentMandate to revoke"
    )
