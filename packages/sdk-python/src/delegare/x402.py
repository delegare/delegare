import base64
import json

import httpx

from .models import X402PaymentReceipt, X402Requirement


def parse_x402_requirements(response_body: str) -> list[X402Requirement]:
    """Parse 402 response body for X402Requirement[]"""
    try:
        data = json.loads(response_body)
        if isinstance(data, dict) and "accepts" in data:
            return [X402Requirement.model_validate(req) for req in data["accepts"]]
        elif isinstance(data, list):
            return [X402Requirement.model_validate(req) for req in data]
        return []
    except Exception:
        return []




def decode_payment_receipt(response: httpx.Response) -> X402PaymentReceipt:
    """Decode base64 X-PAYMENT-RESPONSE header"""
    try:
        header_value = response.headers.get("x-payment-response")
        if not header_value:
            raise ValueError("No x-payment-response header found")
        decoded = base64.b64decode(header_value).decode("utf-8")
        data = json.loads(decoded)
        return X402PaymentReceipt.model_validate(data)
    except Exception as e:
        from .exceptions import X402Error

        raise X402Error(f"Failed to decode payment receipt: {e}") from e
