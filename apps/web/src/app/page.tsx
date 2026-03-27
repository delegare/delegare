import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-zinc-950 text-white font-sans">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-zinc-800 bg-zinc-950/80 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto lg:rounded-xl lg:border lg:p-4">
          Delegare.dev
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-zinc-950 via-zinc-950 lg:static lg:h-auto lg:w-auto lg:bg-none">
          <Button variant="outline" asChild>
            <Link href="https://app.delegare.dev">
              Dashboard
            </Link>
          </Button>
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
          <Button size="lg" className="bg-cyan-500 text-zinc-950 hover:bg-cyan-400" asChild>
            <Link href="https://docs.delegare.dev">
              Read the Docs
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800" asChild>
            <Link href="https://app.delegare.dev">
              Get API Keys
            </Link>
          </Button>
        </div>
      </div>

      <div className="mb-32 grid text-left lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors group cursor-pointer">
          <Link href="https://docs.delegare.dev/concepts/spending-delegates">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                Atomic Limits <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                DynamoDB-backed enforcement prevents overspending, even with concurrent API calls.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors group cursor-pointer">
          <Link href="https://docs.delegare.dev/api-reference/payments/charge">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                Dual-Rail <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Settle in fiat via Stripe or USDC on Base L2, with automatic failover.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors group cursor-pointer">
          <Link href="https://github.com/delegare/delegare">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                Open Source <span className="inline-block transition-transform group-hover:translate-x-1">-&gt;</span>
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Explore our SDKs and architecture. Transparency is the foundation of trust.
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>
    </main>
  );
}
