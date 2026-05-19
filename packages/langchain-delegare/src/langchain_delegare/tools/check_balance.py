from typing import Any

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from pydantic import BaseModel, Field

from ._base import DelegareInputBase, DelegareToolBase


class CheckBalanceInput(DelegareInputBase):
    intent_mandate: str = Field(
        alias="intentMandate",
        description="The intentMandate (SD-JWT-VC) stored in agent context",
    )


class CheckBalanceTool(DelegareToolBase):
    name: str = "check_mandate_balance"
    description: str = "Check remaining monthly budget and masked payment methods for a spending mandate. Never returns card numbers or wallet seeds — only masked summaries."
    args_schema: type[BaseModel] = CheckBalanceInput

    def _run(
        self,
        intent_mandate: str,
        run_manager: CallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = self.sync_client.get_balance(intent_mandate)
        return res.model_dump(by_alias=True)

    async def _arun(
        self,
        intent_mandate: str,
        run_manager: AsyncCallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = await self.async_client.get_balance(intent_mandate)
        return res.model_dump(by_alias=True)
