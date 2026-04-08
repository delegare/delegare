"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";

interface MerchantPublicView {
  merchantId: string;
  name: string;
  totalTransactions: number;
  totalVolumeCents: number;
  status: string;
  createdAt: string;
  walletAddress?: string;
  twitterHandle?: string;
}

export default function PublicProfilePage() {
  const params = useParams();
  const rawHandle = Array.isArray(params.handle) ? params.handle[0] : params.handle;

  // Only `/@foo` is valid — anything else is a 404. This keeps the root
  // namespace free for future static routes and gives @-handles a canonical shape.
  if (!rawHandle || !rawHandle.startsWith("@") || rawHandle.length < 2) {
    notFound();
  }

  // Strip the leading @ for the API call; the backend stores merchantIds without it.
  const handle = rawHandle.slice(1);

  const [merchant, setMerchant] = useState<MerchantPublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.delegare.dev';

  useEffect(() => {
    if (!handle) return;

    fetch(`${API_URL}/v1/merchants/${handle}`)
      .then(res => {
        if (!res.ok) throw new Error("Merchant not found");
        return res.json();
      })
      .then(data => {
        setMerchant(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [handle, API_URL]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#f0ede8] flex items-center justify-center font-sans">
        <p className="text-[#f0ede8]/50">Loading profile...</p>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="min-h-screen bg-[#0c0c0c] text-[#f0ede8] flex flex-col items-center justify-center font-sans gap-4">
        <h1 className="text-2xl font-medium">Merchant Not Found</h1>
        <p className="text-[#f0ede8]/50">The handle '@{handle}' does not exist or is inactive.</p>
        <Link href="/" className="text-[#c8b99a] hover:underline mt-4">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#f0ede8] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111111] border border-[#f0ede8]/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#c8b99a]/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-[#c8b99a] text-3xl font-serif">
              {merchant.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-medium mb-2">{merchant.name}</h1>
          <p className="text-[#f0ede8]/60 text-sm mb-1">@{merchant.merchantId}</p>
          <div className="inline-block bg-[#7ec898]/10 text-[#7ec898] text-xs px-2 py-1 rounded-full border border-[#7ec898]/20 mt-2">
            Accepting Autonomous Payments
          </div>
        </div>

        <div className="space-y-4 mb-8 text-sm">
          {merchant.walletAddress && (
            <div className="flex justify-between border-b border-[#f0ede8]/10 pb-3">
              <span className="text-[#f0ede8]/50">Wallet (Base)</span>
              <span className="font-mono text-[#c8b99a]">{merchant.walletAddress.slice(0, 6)}...{merchant.walletAddress.slice(-4)}</span>
            </div>
          )}
          {merchant.twitterHandle && (
            <div className="flex justify-between border-b border-[#f0ede8]/10 pb-3">
              <span className="text-[#f0ede8]/50">Twitter</span>
              <span><a href={`https://twitter.com/${merchant.twitterHandle}`} className="text-[#c8b99a] hover:underline" target="_blank" rel="noreferrer">@{merchant.twitterHandle}</a></span>
            </div>
          )}
          <div className="flex justify-between border-b border-[#f0ede8]/10 pb-3">
            <span className="text-[#f0ede8]/50">Joined</span>
            <span>{new Date(merchant.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0ede8]/10 pb-3">
            <span className="text-[#f0ede8]/50">Completed Transactions</span>
            <span>{merchant.totalTransactions.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-[#f0ede8]/5 rounded-xl p-5 mb-6 text-center border border-[#f0ede8]/10">
          <h3 className="font-medium text-sm mb-2 text-[#c8b99a]">Pay with your AI Agent</h3>
          <p className="text-xs text-[#f0ede8]/60 leading-relaxed mb-4">
            Copy the prompt below and paste it into ChatGPT, Claude, or OpenClaw to autonomously send a payment.
          </p>
          <div className="bg-[#000000] p-3 rounded-lg text-left overflow-x-auto border border-[#f0ede8]/10">
            <code className="text-xs text-[#7ec898] whitespace-pre">
              "Pay 5 USDC to @{merchant.merchantId} for a coffee"
            </code>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-[#f0ede8]/40 mb-3">Don't have an agent budget set up yet?</p>
          <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://app.delegare.dev'}/setup?merchant=${merchant.merchantId}`} className="block w-full py-3 px-4 bg-[#c8b99a]/10 hover:bg-[#c8b99a]/20 text-[#c8b99a] border border-[#c8b99a]/30 rounded-xl text-sm font-medium transition-colors">
            Connect your Agent
          </a>
        </div>
      </div>
    </div>
  );
}