from typing import Any

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from pydantic import BaseModel, ConfigDict, Field

from ._base import DelegareToolBase, DelegareInputBase


class RevokeMandateInput(DelegareInputBase):

    intent_mandate: str = Field(
        alias="intentMandate", description="The intentMandate to revoke"
    )


class RevokeMandateTool(DelegareToolBase):
    name: str = "revoke_mandate"
    description: str = "Immediately revoke a spending mandate. After revocation, no further charges can be made with this intentMandate. The user can create a new mandate at any time."
    args_schema: type[BaseModel] = RevokeMandateInput

    def _run(
        self,
        intent_mandate: str,
        run_manager: CallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = self.sync_client.revoke(intent_mandate)
        return res.model_dump(by_alias=True)

    async def _arun(
        self,
        intent_mandate: str,
        run_manager: AsyncCallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = await self.async_client.revoke(intent_mandate)
        return res.model_dump(by_alias=True)
