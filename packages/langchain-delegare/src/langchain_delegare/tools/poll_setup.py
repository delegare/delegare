from typing import Any

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from pydantic import BaseModel, Field

from ._base import DelegareInputBase, DelegareToolBase


class PollSetupInput(DelegareInputBase):
    session_token: str = Field(
        alias="sessionToken",
        description="The sessionToken returned by setup_spending_mandate",
    )


class PollSetupTool(DelegareToolBase):
    name: str = "poll_setup_session"
    description: str = "Check whether the user has completed the payment setup flow. Call this after presenting the setup URL. Returns the intentMandate once complete — store it in agent context for future payments."
    args_schema: type[BaseModel] = PollSetupInput

    def _run(
        self,
        session_token: str | None = None, sessionToken: str | None = None,
        run_manager: CallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = self.sync_client.get_setup_session(session_token or kwargs.get("sessionToken"))
        return res.model_dump(by_alias=True)

    async def _arun(
        self,
        session_token: str | None = None, sessionToken: str | None = None,
        run_manager: AsyncCallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        res = await self.async_client.get_setup_session(session_token or kwargs.get("sessionToken"))
        return res.model_dump(by_alias=True)
