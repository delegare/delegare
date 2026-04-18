import { Delegare } from '@delegare/sdk';
import 'dotenv/config';

// ── Agent Client Initialization ─────────────────────────────────────────
// The SDK authenticates the agent with the Delegare platform.
// We use the AGENT_MANDATE to pay the 402 challenge.
const delegare = new Delegare({
  baseUrl: process.env.DELEGARE_BASE_URL || 'https://api.sandbox.delegare.dev/v1',
  merchantId: process.env.DELEGARE_MERCHANT_ID,
  apiKey: process.env.DELEGARE_API_KEY,
});

async function testX402() {
  const intentMandate = process.env.DELEGARE_MANDATE;
  if (!intentMandate) {
    console.error('❌ Missing DELEGARE_MANDATE in .env. Please add it to test.');
    process.exit(1);
  }

  const endpoint = 'http://localhost:4000/api/premium-data';

  console.log(`🤖 Agent requesting: ${endpoint}`);
  console.log('⏳ Attempting smart fetch (auto-handling 402 challenge)...');

  // The SDK `.fetch` method automatically intercepts the HTTP 402 Payment Required 
  // response, extracts the price requirements, applies the `intentMandate`, 
  // and transparently retries the request for you!
  const res = await delegare.fetch(endpoint, undefined, intentMandate);

  if (res.ok) {
    console.log('\n🎉 Success! Received Premium Data:');
    console.log(await res.json());

    // The middleware automatically attaches the transaction receipt to the response headers
    const receipt = delegare.decodePaymentReceipt(res);
    if (receipt) {
      console.log('\n📜 Validated Payment Receipt from Header:', receipt);
      console.log(`   Explorer Link: https://sepolia.basescan.org/tx/${receipt.transaction}`);
    }
  } else {
    console.error(`\n❌ Request failed with status ${res.status}:`, await res.text());
  }
}

testX402();
