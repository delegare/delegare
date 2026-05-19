import asyncio
import os

from langchain_delegare import DelegareToolkit, get_idempotency_key

# from langgraph.prebuilt import create_react_agent
# from langchain_openai import ChatOpenAI


async def main() -> None:
    merchant_id = os.environ.get("DELEGARE_MERCHANT_ID", "test_merchant")
    api_key = os.environ.get("DELEGARE_API_KEY", "test_key")

    toolkit = DelegareToolkit.from_api_key(merchant_id=merchant_id, api_key=api_key)
    tools = toolkit.get_tools()  # noqa: F841

    # In LangGraph, we can safely derive the idempotencyKey from the state's thread_id
    # to prevent accidental double-charges if a graph node crashes and restarts.
    # We use `get_idempotency_key(thread_id, run_id, tool_call_id)` internally.

    # Note: If your LLM calls authorize_agent_payment directly, the LLM provides
    # the idempotencyKey. You can override the tool implementation or inject the
    # derived key at call-time using LangGraph context variables.

    thread_id = "thread_xyz"
    run_id = "run_abc"
    tool_call_id = "call_123"

    safe_key = get_idempotency_key(thread_id, run_id, tool_call_id)
    print(f"Derived safe idempotency key: {safe_key}")
    print("Use this key inside your LLM prompts or tool interceptors to ensure idempotent charges.")


if __name__ == "__main__":
    asyncio.run(main())
