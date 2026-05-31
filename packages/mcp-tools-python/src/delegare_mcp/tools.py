import base64
import json
from typing import Any

import mcp.types as types
from delegare import ApiKeyAuth, ChargeRequest, Delegare, SetupDelegateRequest
from mcp.server import Server
from pydantic import BaseModel

from .schemas import (
<<<<<<< HEAD
    AuthorizePaymentOutput,
    AuthorizePaymentSchema,
    CheckMandateBalanceOutput,
    CheckMandateBalanceSchema,
    DelegareFetchOutput,
    DelegareFetchSchema,
    PollSetupSessionOutput,
    PollSetupSessionSchema,
    RevokeMandateOutput,
    RevokeMandateSchema,
    SetupSpendingMandateOutput,
=======
    AuthorizePaymentOutputSchema,
    AuthorizePaymentSchema,
    CheckMandateBalanceOutputSchema,
    CheckMandateBalanceSchema,
    DelegareFetchOutputSchema,
    DelegareFetchSchema,
    PollSetupSessionOutputSchema,
    PollSetupSessionSchema,
    RevokeMandateOutputSchema,
    RevokeMandateSchema,
    SetupSpendingMandateOutputSchema,
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
    SetupSpendingMandateSchema,
)


class RegisterDelegareToolsOptions(BaseModel):
    merchant_id: str
    api_key: str = ""
    base_url: str | None = None
    allowed_amounts_cents: list[int] | None = None


def register_delegare_tools(server: Server, options: RegisterDelegareToolsOptions) -> None:
    client = Delegare(
        config=ApiKeyAuth(
            merchant_id=options.merchant_id,
            api_key=options.api_key,
            base_url=options.base_url or "https://api.delegare.dev/v1",
        )
    )

    tools_definitions = [
        types.Tool(
            name="setup_spending_mandate",
            description="Initiate the one-time browser setup flow so the user can connect their payment method and set spending limits. Returns a URL the user must visit. Returns sessionToken for polling.",
            inputSchema=SetupSpendingMandateSchema.model_json_schema(),
<<<<<<< HEAD
            outputSchema=SetupSpendingMandateOutput.model_json_schema(),
            annotations=types.ToolAnnotations(
                title="Set Up Spending Mandate",
                readOnlyHint=False,
                destructiveHint=False,
                idempotentHint=False,
                openWorldHint=True,
            ),
=======
            outputSchema=SetupSpendingMandateOutputSchema.model_json_schema(),  # type: ignore
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
        ),
        types.Tool(
            name="poll_setup_session",
            description="Check whether the user has completed the payment setup flow. Call this after presenting the setup URL. Returns the intentMandate once complete — store it in agent context for future payments.",
            inputSchema=PollSetupSessionSchema.model_json_schema(),
<<<<<<< HEAD
            outputSchema=PollSetupSessionOutput.model_json_schema(),
            annotations=types.ToolAnnotations(
                title="Poll Setup Session",
                readOnlyHint=True,
                destructiveHint=False,
                idempotentHint=True,
                openWorldHint=True,
            ),
=======
            outputSchema=PollSetupSessionOutputSchema.model_json_schema(),  # type: ignore
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
        ),
        types.Tool(
            name="check_mandate_balance",
            description="Check remaining monthly budget and masked payment methods for a spending mandate. Never returns card numbers or wallet seeds — only masked summaries.",
            inputSchema=CheckMandateBalanceSchema.model_json_schema(),
<<<<<<< HEAD
            outputSchema=CheckMandateBalanceOutput.model_json_schema(),
            annotations=types.ToolAnnotations(
                title="Check Mandate Balance",
                readOnlyHint=True,
                destructiveHint=False,
                idempotentHint=True,
                openWorldHint=True,
            ),
=======
            outputSchema=CheckMandateBalanceOutputSchema.model_json_schema(),  # type: ignore
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
        ),
        types.Tool(
            name="authorize_agent_payment",
            description="Execute a payment through the Delegare vault using AP2. The agent presents its Intent Mandate (SD-JWT-VC). Spending limits are enforced server-side. IMPORTANT: amountCents is in US cents — divide by 100 for the dollar amount (e.g. amountCents=50 means $0.50, NOT 50 dollars or 50 USDC).",
            inputSchema=AuthorizePaymentSchema.model_json_schema(),
<<<<<<< HEAD
            outputSchema=AuthorizePaymentOutput.model_json_schema(),
            annotations=types.ToolAnnotations(
                title="Authorize Agent Payment",
                readOnlyHint=False,
                destructiveHint=False,
                idempotentHint=False,
                openWorldHint=True,
            ),
=======
            outputSchema=AuthorizePaymentOutputSchema.model_json_schema(),  # type: ignore
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
        ),
        types.Tool(
            name="delegare_fetch",
            description="Fetch a URL. If the resource requires payment via x402, this tool will automatically use the provided spending mandate to authorize the payment and retrieve the data. Supports both GET and POST.",
            inputSchema=DelegareFetchSchema.model_json_schema(),
<<<<<<< HEAD
            outputSchema=DelegareFetchOutput.model_json_schema(),
            annotations=types.ToolAnnotations(
                title="Delegare Fetch",
                readOnlyHint=False,
                destructiveHint=False,
                idempotentHint=False,
                openWorldHint=True,
            ),
=======
            outputSchema=DelegareFetchOutputSchema.model_json_schema(),  # type: ignore
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
        ),
        types.Tool(
            name="revoke_mandate",
            description="Immediately revoke a spending mandate. After revocation, no further charges can be made with this intentMandate. The user can create a new mandate at any time.",
            inputSchema=RevokeMandateSchema.model_json_schema(),
<<<<<<< HEAD
            outputSchema=RevokeMandateOutput.model_json_schema(),
            annotations=types.ToolAnnotations(
                title="Revoke Mandate",
                readOnlyHint=False,
                destructiveHint=True,
                idempotentHint=True,
                openWorldHint=True,
            ),
=======
            outputSchema=RevokeMandateOutputSchema.model_json_schema(),  # type: ignore
>>>>>>> 3c9db2c... release(mcp-tools): annotations + descriptions for ChatGPT/Claude submission
        ),
    ]

    # In mcp python SDK, you can't easily dynamically append to tools without wrapping the list_tools and call_tool handlers.
    # To correctly register dynamically, we will wrap the server.request_handlers

    @server.list_tools()  # type: ignore
    async def handle_list_tools() -> list[types.Tool]:
        return tools_definitions

    @server.call_tool()  # type: ignore
    async def handle_call_tool(
        name: str, arguments: dict[str, Any] | None
    ) -> (
        list[types.TextContent]
        | tuple[list[types.TextContent], dict[str, Any]]
        | types.CallToolResult
    ):
        args = arguments or {}

        if name == "setup_spending_mandate":
            parsed = SetupSpendingMandateSchema(**args)

            session = client.create_setup_session(
                SetupDelegateRequest(
                    maxMonthlySpendCents=parsed.max_monthly_spend_cents,
                    maxPerTxCents=parsed.max_per_tx_cents,
                    rail=parsed.rail,
                    railPreference=parsed.rail_preference,
                )
            )

            out: dict[str, Any] = {
                "message": "Please ask the user to visit the setup URL to connect their payment method. This is a one-time step. The setup URL expires in 10 minutes. Use poll_setup_session with the sessionToken to check when setup is complete.",
                "setupUrl": session.setup_url,
                "sessionToken": session.session_token,
                "expiresInSeconds": session.expires_in_seconds,
            }
            return [types.TextContent(type="text", text=json.dumps(out))], out

        elif name == "poll_setup_session":
            parsed_poll = PollSetupSessionSchema(**args)
            result = client.get_setup_session(parsed_poll.session_token)
            poll_out: dict[str, Any] = result.model_dump(by_alias=True, mode="json")
            return [types.TextContent(type="text", text=json.dumps(poll_out))], poll_out

        elif name == "check_mandate_balance":
            parsed_bal = CheckMandateBalanceSchema(**args)
            balance = client.get_balance(parsed_bal.intent_mandate)
            bal_out: dict[str, Any] = balance.model_dump(by_alias=True, mode="json")
            return [types.TextContent(type="text", text=json.dumps(bal_out))], bal_out

        elif name == "authorize_agent_payment":
            parsed_auth = AuthorizePaymentSchema(**args)

            if options.allowed_amounts_cents and parsed_auth.amount_cents not in options.allowed_amounts_cents:
                return types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text=json.dumps(
                                {
                                    "error": "amount_not_allowed",
                                    "message": f"Amount {parsed_auth.amount_cents} cents is not in the allowed amounts list",
                                    "allowedAmounts": options.allowed_amounts_cents,
                                }
                            ),
                        )
                    ],
                    isError=True,
                )

            metadata = None
            if parsed_auth.metadata_json:
                try:
                    metadata = json.loads(parsed_auth.metadata_json)
                except Exception:
                    metadata = None

            receipt = client.charge(
                ChargeRequest(
                    intentMandate=parsed_auth.intent_mandate,
                    amountCents=parsed_auth.amount_cents,
                    currency=parsed_auth.currency,
                    description=parsed_auth.description,
                    idempotencyKey=parsed_auth.idempotency_key,
                    metadata=metadata,
                )
            )

            usd_amount = f"{parsed_auth.amount_cents / 100:.2f}"
            res_dict = receipt.model_dump(by_alias=True)
            res_dict["amountUsd"] = f"${usd_amount}"
            res_dict["note"] = (
                f"Payment of ${usd_amount} ({parsed_auth.amount_cents} cents) processed via {parsed_auth.currency.upper()} on Base."
            )

            return [types.TextContent(type="text", text=json.dumps(res_dict))], res_dict

        elif name == "delegare_fetch":
            parsed_fetch = DelegareFetchSchema(**args)
            try:
                headers = {"Content-Type": "application/json"}
                init: dict[str, Any] = {
                    "method": parsed_fetch.method,
                    "headers": headers,
                }
                if parsed_fetch.body:
                    init["content"] = parsed_fetch.body

                response = client.fetch(parsed_fetch.url, intent_mandate=parsed_fetch.intent_mandate, **init)
                text = response.text

                is_json = "application/json" in response.headers.get("content-type", "")
                data = None
                if is_json:
                    try:
                        data = response.json()
                    except Exception:
                        data = text
                else:
                    data = text

                x_payment_response = response.headers.get("x-payment-response")
                receipt = None
                if x_payment_response:
                    try:
                        receipt = json.loads(base64.b64decode(x_payment_response).decode("utf8"))
                    except Exception:
                        pass

                fetch_out: dict[str, Any] = {
                    "status": response.status_code,
                    "content": data,
                    "paymentExecuted": bool(receipt),
                    "receipt": receipt,
                }
                return [types.TextContent(type="text", text=json.dumps(fetch_out))], fetch_out

            except Exception as err:
                return types.CallToolResult(
                    content=[types.TextContent(type="text", text=json.dumps({"error": str(err)}))],
                    isError=True,
                )

        elif name == "revoke_mandate":
            parsed_revoke = RevokeMandateSchema(**args)
            result_rev = client.revoke(parsed_revoke.intent_mandate)
            revoke_out: dict[str, Any] = result_rev.model_dump(by_alias=True, mode="json")
            return [types.TextContent(type="text", text=json.dumps(revoke_out))], revoke_out

        raise ValueError(f"Unknown tool: {name}")
