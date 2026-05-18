from typing import Any, Literal, TypeAlias

from pydantic import BaseModel, ConfigDict, Field

Currency: TypeAlias = Literal["usd", "usdc", "usdt"]
Rail: TypeAlias = Literal["fiat", "crypto"]
RailPreference: TypeAlias = Literal[
    "auto", "fiat_first", "crypto_first", "cheapest", "fastest"
]
DelegateStatus: TypeAlias = Literal["active", "paused", "revoked", "expired"]
ChargeStatus: TypeAlias = Literal["pending", "completed", "failed", "refunded"]
SetupStatus: TypeAlias = Literal["pending", "complete", "expired"]
MandateStatus: TypeAlias = Literal["active", "revoked", "expired"]


class ChargeRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    amount_cents: int = Field(alias="amountCents")
    currency: Currency
    idempotency_key: str = Field(alias="idempotencyKey")
    intent_mandate: str = Field(alias="intentMandate")
    description: str | None = None
    metadata: dict[str, str] | None = None


class PaymentMethodSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    rail: Rail
    display: str
    status: Literal["active", "expired", "failed"]


class ChargeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    receipt_id: str = Field(alias="receiptId")
    status: ChargeStatus
    amount_cents: int = Field(alias="amountCents")
    currency: Currency
    rail_used: Rail | None = Field(default=None, alias="railUsed")
    tx_hash: str | None = Field(default=None, alias="txHash")
    stripe_payment_intent_id: str | None = Field(
        default=None, alias="stripePaymentIntentId"
    )
    failure_reason: str | None = Field(default=None, alias="failureReason")


class RailSpent(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    spent_cents: int = Field(alias="spentCents")
    transactions: int


class SpentByRail(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    fiat: RailSpent
    crypto: RailSpent


class BalanceResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mandate_id: str = Field(alias="mandateId")
    status: MandateStatus
    monthly_limit_cents: int = Field(alias="monthlyLimitCents")
    remaining_monthly_budget_cents: int = Field(alias="remainingMonthlyBudgetCents")
    spent_by_rail: SpentByRail = Field(alias="spentByRail")
    payment_methods: list[PaymentMethodSummary] = Field(alias="paymentMethods")
    rail_preference: RailPreference = Field(alias="railPreference")
    expires_at: str | None = Field(default=None, alias="expiresAt")


class SetupDelegateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    max_monthly_spend_cents: int = Field(alias="maxMonthlySpendCents")
    max_per_tx_cents: int = Field(alias="maxPerTxCents")
    rail: Literal["fiat", "crypto", "both"] | None = None
    rail_preference: RailPreference | None = Field(default=None, alias="railPreference")
    allowed_merchant_ids: list[str] | None = Field(
        default=None, alias="allowedMerchantIds"
    )
    expires_at: str | None = Field(default=None, alias="expiresAt")


class SetupDelegateResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    setup_url: str = Field(alias="setupUrl")
    session_token: str = Field(alias="sessionToken")
    expires_in_seconds: int = Field(alias="expiresInSeconds")


class SetupSessionStatus(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: SetupStatus
    intent_mandate: str | None = Field(default=None, alias="intentMandate")
    masked_payment_methods: list[PaymentMethodSummary] | None = Field(
        default=None, alias="maskedPaymentMethods"
    )


class RevokeResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    success: bool
    mandate_id: str | None = Field(default=None, alias="mandateId")
    revoked_at: str = Field(alias="revokedAt")


class X402Requirement(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    scheme: Literal["exact"] = "exact"
    network: Literal["base", "base-sepolia"]
    asset: str
    max_amount_required: str = Field(alias="maxAmountRequired")
    pay_to: str = Field(alias="payTo")
    resource: str
    mime_type: str | None = Field(default=None, alias="mimeType")
    max_timeout_seconds: int | None = Field(default=None, alias="maxTimeoutSeconds")
    extra: dict[str, Any] | None = None


class X402PaymentReceipt(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="allow")

    success: bool
    transaction: str
    network: Literal["base", "base-sepolia"]
    payer: str
