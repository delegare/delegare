import base64
import json
from typing import Any

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from pydantic import BaseModel, Field

from ._base import DelegareInputBase, DelegareToolBase


class DelegareFetchInput(DelegareInputBase):
    url: str = Field(description="The URL to fetch")
    method: str = Field(default="GET", description="HTTP method")
    body: str | None = Field(default=None, description="Optional JSON body for POST requests")
    intent_mandate: str = Field(
        alias="intentMandate",
        description="Your active spending delegate token (intentMandate)",
    )


class DelegareFetchTool(DelegareToolBase):
    name: str = "delegare_fetch"
    description: str = "Fetch a URL. If the resource requires payment via x402, this tool will automatically use the provided spending mandate to authorize the payment and retrieve the data. Supports both GET and POST."
    args_schema: type[BaseModel] = DelegareFetchInput

    def _run(
        self,
        url: str,
        method: str,
        intent_mandate: str | None = None, intentMandate: str | None = None,
        body: str | None = None,
        run_manager: CallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        try:
            headers = {"Content-Type": "application/json"}
            init: dict[str, Any] = {"method": method, "headers": headers}
            if body:
                init["content"] = body

            response = self.sync_client.fetch(url, intent_mandate=(intent_mandate or kwargs.get("intentMandate")), **init)
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

            return {
                "status": response.status_code,
                "content": data,
                "paymentExecuted": bool(receipt),
                "receipt": receipt,
            }

        except Exception as err:
            return {"error": str(err)}

    async def _arun(
        self,
        url: str,
        method: str,
        intent_mandate: str | None = None, intentMandate: str | None = None,
        body: str | None = None,
        run_manager: AsyncCallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        try:
            headers = {"Content-Type": "application/json"}
            init: dict[str, Any] = {"method": method, "headers": headers}
            if body:
                init["content"] = body

            response = await self.async_client.fetch(url, intent_mandate=(intent_mandate or kwargs.get("intentMandate")), **init)
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

            return {
                "status": response.status_code,
                "content": data,
                "paymentExecuted": bool(receipt),
                "receipt": receipt,
            }

        except Exception as err:
            return {"error": str(err)}
