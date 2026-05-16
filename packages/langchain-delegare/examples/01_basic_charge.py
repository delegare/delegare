import asyncio
import os
from langchain_delegare import DelegareToolkit
from langchain_core.messages import HumanMessage
# from langgraph.prebuilt import create_react_agent
# In a real environment, you'd import ChatOpenAI or similar.
# from langchain_openai import ChatOpenAI

async def main() -> None:
    # Requires DELEGARE_MERCHANT_ID and DELEGARE_API_KEY environment variables
    merchant_id = os.environ.get("DELEGARE_MERCHANT_ID", "test_merchant")
    api_key = os.environ.get("DELEGARE_API_KEY", "test_key")
    
    toolkit = DelegareToolkit.from_api_key(
        merchant_id=merchant_id, 
        api_key=api_key,
        allowed_amounts_cents=[50, 100, 500] # Safe whitelist for agents
    )
    tools = toolkit.get_tools()
    
    print(f"Loaded {len(tools)} tools:")
    for tool in tools:
        print(f"- {tool.name}")
        
    # Example integration with LangGraph (mocked LLM not included in bare example)
    # model = ChatOpenAI(model="gpt-4o")
    # agent_executor = create_react_agent(model, tools)
    
    # response = await agent_executor.ainvoke(
    #     {"messages": [HumanMessage(content="Check my balance for intent mandate 'mandate_123'")]}
    # )
    # print(response["messages"][-1].content)

if __name__ == "__main__":
    asyncio.run(main())
