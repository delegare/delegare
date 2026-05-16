import json
from typing import Any
from uuid import UUID

from delegare import AsyncDelegare
from delegare.exceptions import BudgetExceededError
from langchain_core.callbacks import BaseCallbackHandler


class DelegareBudgetCallbackHandler(BaseCallbackHandler):
    """Callback handler to track and enforce budget limits."""

    run_inline = False

    def __init__(
        self, async_client: AsyncDelegare, halt_at_pct: float | None = None
    ) -> None:
        self.async_client = async_client
        self.halt_at_pct = halt_at_pct
        self.budget_warnings: list[str] = []

    async def on_tool_end(
        self,
        output: Any,
        *,
        run_id: UUID,
        parent_run_id: UUID | None = None,
        **kwargs: Any,
    ) -> None:
        """Check balance if an authorize_agent_payment tool finishes."""
        if kwargs.get("name") == "authorize_agent_payment":
            try:
                # If output is string, parse it.
                if isinstance(output, str):
                    res = json.loads(output)
                else:
                    res = output

                # We need the intent_mandate to check the balance. The tool kwargs should have inputs.
                inputs = kwargs.get("inputs", {})
                intent_mandate = inputs.get("intentMandate") or inputs.get(
                    "intent_mandate"
                )

                if intent_mandate:
                    balance = await self.async_client.get_balance(intent_mandate)

                    if self.halt_at_pct is not None:
                        # e.g., if halt_at_pct = 0.9, halt if spent > 90% of limit
                        limit = balance.monthly_limit_cents
                        spent = (
                            balance.monthly_limit_cents
                            - balance.remaining_monthly_budget_cents
                        )
                        if limit > 0 and (spent / limit) >= self.halt_at_pct:
                            raise BudgetExceededError(
                                f"Budget threshold ({self.halt_at_pct * 100}%) reached. Spent {spent} of {limit} cents."
                            )
            except BudgetExceededError:
                raise
            except Exception:
                pass
