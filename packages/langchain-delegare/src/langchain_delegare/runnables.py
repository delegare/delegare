from typing import Any

from delegare import AsyncDelegare, Delegare
from langchain_core.runnables import RunnableConfig, RunnableSerializable


class X402AutoPayRunnable(RunnableSerializable[dict[str, Any], Any]):
    """Runnable to handle x402 auto-pay logic in LCEL."""

    sync_client: Delegare
    async_client: AsyncDelegare

    model_config = {"arbitrary_types_allowed": True}

    def invoke(
        self,
        input: dict[str, Any],
        config: RunnableConfig | None = None,
        **kwargs: Any,
    ) -> Any:
        url = input.get("url")
        if not url:
            raise ValueError("Input must contain a 'url' key")

        intent_mandate = input.get("intent_mandate")
        method = input.get("method", "GET")
        headers = input.get("headers")
        body = input.get("body")

        init = {"method": method}
        if headers:
            init["headers"] = headers
        if body:
            init["content"] = body

        res = self.sync_client.fetch(url, intent_mandate=intent_mandate, **init)

        try:
            is_json = "application/json" in res.headers.get("content-type", "")
            return res.json() if is_json else res.text
        except Exception:
            return res.text

    async def ainvoke(
        self,
        input: dict[str, Any],
        config: RunnableConfig | None = None,
        **kwargs: Any,
    ) -> Any:
        url = input.get("url")
        if not url:
            raise ValueError("Input must contain a 'url' key")

        intent_mandate = input.get("intent_mandate")
        method = input.get("method", "GET")
        headers = input.get("headers")
        body = input.get("body")

        init = {"method": method}
        if headers:
            init["headers"] = headers
        if body:
            init["content"] = body

        res = await self.async_client.fetch(url, intent_mandate=intent_mandate, **init)

        try:
            is_json = "application/json" in res.headers.get("content-type", "")
            return res.json() if is_json else res.text
        except Exception:
            return res.text
