from typing import Any

import httpx
from delegare import decode_payment_receipt
from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from pydantic import BaseModel, Field

from ._base import DelegareInputBase, DelegareToolBase


class VerifyReceiptInput(DelegareInputBase):
    x_payment_response_header: str = Field(
        description="The base64 encoded X-PAYMENT-RESPONSE header to decode and verify"
    )


class VerifyReceiptTool(DelegareToolBase):
    name: str = "verify_receipt"
    description: str = "Decode and verify an X-PAYMENT-RESPONSE header returned from an x402 auto-pay fetch to ensure a charge successfully settled on-chain."
    args_schema: type[BaseModel] = VerifyReceiptInput

    def _run(
        self,
        x_payment_response_header: str,
        run_manager: CallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        try:
            # We mock a Response object to pass to the decode function
            res = httpx.Response(
                200, headers={"x-payment-response": x_payment_response_header}
            )
            receipt = decode_payment_receipt(res)
            return receipt.model_dump(by_alias=True)
        except Exception as err:
            return {"error": str(err)}

    async def _arun(
        self,
        x_payment_response_header: str,
        run_manager: AsyncCallbackManagerForToolRun | None = None,
        **kwargs: Any,
    ) -> Any:
        try:
            res = httpx.Response(
                200, headers={"x-payment-response": x_payment_response_header}
            )
            receipt = decode_payment_receipt(res)
            return receipt.model_dump(by_alias=True)
        except Exception as err:
            return {"error": str(err)}
