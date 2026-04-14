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
  let rawHandle = Array.isArray(params.handle) ? params.handle[0] : params.handle;

  if (!rawHandle) {
    notFound();
  }

  // Handle URL-encoded @ or trailing slashes that might have seeped into the param
  rawHandle = decodeURIComponent(rawHandle).replace(/\/$/, "");

  // Only `/@foo` is valid — anything else is a 404. 
  // If the segment doesn't start with @, we don't want to capture it here
  // (prevents collision with future static root routes).
  if (!rawHandle.startsWith("@") || rawHandle.length < 2) {
    notFound();
  }

  // Strip the leading @ for the API call
  const handle = rawHandle.slice(1);

  const [merchant, setMerchant] = useState<MerchantPublicView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Determine API URL based on environment (default to empty so we don't fetch until we know)
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('sandbox') || hostname.includes('localhost')) {
      setApiUrl('https://api.sandbox.delegare.dev/v1');
    } else {
      setApiUrl('https://api.delegare.dev/v1');
    }
  }, []);

  useEffect(() => {
    if (!handle || !apiUrl) return;
    
    // Reset states for new fetch
    setLoading(true);
    setError("");

    fetch(`${apiUrl}/merchants/${handle}`)
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
  }, [handle, apiUrl]);

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
          <div className="bg-[#000000] p-3 rounded-lg text-left overflow-x-auto border border-[#f0ede8]/10 mb-4">
            <code className="text-xs text-[#7ec898] whitespace-pre">
              "Pay 5 USDC to @{merchant.merchantId} for a coffee"
            </code>
          </div>

          <div className="border-t border-[#f0ede8]/10 pt-4 mt-4 text-left">
            <h4 className="text-xs font-semibold text-[#f0ede8]/80 mb-2 uppercase tracking-wide">Agent Setup</h4>
            <div className="flex flex-col gap-2">
              <a href="/delegare.mcpb" download className="flex items-center gap-2 text-xs bg-[#f0ede8]/5 hover:bg-[#f0ede8]/10 text-[#f0ede8] py-2 px-3 rounded-lg border border-[#f0ede8]/10 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Install for Claude Desktop (1-Click .mcpb)
              </a>
              <a href="https://docs.delegare.dev/sdk-tools/mcp-tools" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-[#f0ede8]/5 hover:bg-[#f0ede8]/10 text-[#f0ede8] py-2 px-3 rounded-lg border border-[#f0ede8]/10 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                View ChatGPT & OpenClaw Instructions
              </a>
            </div>
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