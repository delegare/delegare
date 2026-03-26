export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-zinc-950 text-white">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-950/80 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4">
          Delegare.dev
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-zinc-950 via-zinc-950 lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://app.delegare.dev"
            rel="noopener noreferrer"
          >
            Dashboard
          </a>
        </div>
      </div>

      <div className="relative flex place-items-center flex-col gap-6 before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-cyan-500/20 before:to-transparent before:blur-2xl after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-cyan-500/40 after:via-cyan-600/20 after:blur-2xl">
        <h1 className="text-6xl font-bold tracking-tight text-center max-w-3xl">
          Trustless Agent Payments. <br />
          <span className="text-cyan-400">3¢ per transaction. Always.</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl text-center">
          Empower your AI agents to spend securely without handing over credit card numbers or private keys. 
          Built with dual-rail settlement (Stripe & Base) and atomic limit enforcement.
        </p>
        <div className="flex gap-4 mt-8">
          <a href="https://docs.delegare.dev" className="bg-cyan-500 text-zinc-950 px-6 py-3 rounded-lg font-medium hover:bg-cyan-400 transition-colors">
            Read the Docs
          </a>
          <a href="https://app.delegare.dev" className="bg-zinc-800 text-white px-6 py-3 rounded-lg font-medium border border-zinc-700 hover:bg-zinc-700 transition-colors">
            Get API Keys
          </a>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left">
        <a
          href="https://docs.delegare.dev/concepts/spending-delegates"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Atomic Limits <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            DynamoDB-backed enforcement prevents overspending, even with concurrent API calls.
          </p>
        </a>

        <a
          href="https://docs.delegare.dev/api-reference/payments/charge"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Dual-Rail <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Settle in fiat via Stripe or USDC on Base L2, with automatic failover.
          </p>
        </a>

        <a
          href="https://github.com/delegare/delegare"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-zinc-800 hover:bg-zinc-900/50"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Open Source <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">-&gt;</span>
          </h2>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Explore our SDKs and architecture. Transparency is the foundation of trust.
          </p>
        </a>
      </div>
    </main>
  );
}
