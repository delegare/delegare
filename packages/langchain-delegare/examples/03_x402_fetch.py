import asyncio
import os
from langchain_delegare import DelegareToolkit, X402AutoPayRunnable
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
# from langchain_openai import ChatOpenAI

async def main() -> None:
    merchant_id = os.environ.get("DELEGARE_MERCHANT_ID", "test_merchant")
    api_key = os.environ.get("DELEGARE_API_KEY", "test_key")
    
    toolkit = DelegareToolkit.from_api_key(
        merchant_id=merchant_id, 
        api_key=api_key,
    )
    
    # Creates a runnable that wraps the Delegare fetch() method
    # It catches 402 Payment Required errors, automatically pays the exact amount,
    # and retries the fetch using the intent mandate.
    x402_fetcher = X402AutoPayRunnable(
        sync_client=toolkit.sync_client,
        async_client=toolkit.async_client
    )
    
    # We can compose this directly into an LCEL chain!
    # prompt = PromptTemplate.from_template("Summarize the following data:\\n{data}")
    # model = ChatOpenAI(model="gpt-4o")
    
    # chain = x402_fetcher | prompt | model | StrOutputParser()
    
    # response = await chain.ainvoke({
    #     "url": "https://api.example.com/premium-data",
    #     "intent_mandate": "mandate_123"
    # })
    
    # print(response)
    print("X402AutoPayRunnable ready for LCEL integration.")

if __name__ == "__main__":
    asyncio.run(main())
