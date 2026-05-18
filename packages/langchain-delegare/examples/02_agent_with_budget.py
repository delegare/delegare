import asyncio
import os

from langchain_delegare import DelegareBudgetCallbackHandler, DelegareToolkit

# from langgraph.prebuilt import create_react_agent
# from langchain_openai import ChatOpenAI


async def main() -> None:
    merchant_id = os.environ.get("DELEGARE_MERCHANT_ID", "test_merchant")
    api_key = os.environ.get("DELEGARE_API_KEY", "test_key")

    toolkit = DelegareToolkit.from_api_key(
        merchant_id=merchant_id,
        api_key=api_key,
    )
    tools = toolkit.get_tools()  # noqa: F841

    # Initialize the budget handler to halt execution if we reach 90% of the mandate's limit
    # The handler will check the balance automatically after every authorize_agent_payment call.
    budget_handler = DelegareBudgetCallbackHandler(  # noqa: F841
        async_client=toolkit.async_client, halt_at_pct=0.90
    )

    print("Ready to run agent with Budget Handler checking mandate thresholds...")

    # model = ChatOpenAI(model="gpt-4o")
    # agent_executor = create_react_agent(model, tools)

    # try:
    #     response = await agent_executor.ainvoke(
    #         {"messages": [HumanMessage(content="Process a $5 charge for the API subscription using mandate 'mandate_123'")]},
    #         config={"callbacks": [budget_handler]}
    #     )
    #     print(response["messages"][-1].content)
    # except Exception as e:
    #     print(f"Agent halted: {e}")


if __name__ == "__main__":
    asyncio.run(main())
