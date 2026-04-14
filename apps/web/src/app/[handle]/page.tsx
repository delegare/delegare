"use client";

import { Suspense, useEffect, useState } from "react";
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
  railRequirement?: string;
}

function ProfileContent() {
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
  const [showChatGptModal, setShowChatGptModal] = useState(false);

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

  const mcpUrl = apiUrl ? apiUrl.replace('/v1', '/mcp') : 'https://api.delegare.dev/mcp';

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
        <p className="text-[#f0ede8]/50">The handle &apos;@{handle}&apos; does not exist or is inactive.</p>
        <Link href="/" className="text-[#c8b99a] hover:underline mt-4">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#f0ede8] font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#111111] border border-[#f0ede8]/10 rounded-2xl p-8 shadow-2xl relative">
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
          <div className="flex justify-between border-b border-[#f0ede8]/10 pb-3">
            <span className="text-[#f0ede8]/50">Joined</span>
            <span>{new Date(merchant.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0ede8]/10 pb-3">
            <span className="text-[#f0ede8]/50">Rail</span>
            <span className="text-[#7ec898]">{merchant.railRequirement === 'crypto_only' ? 'USDC / USDT' : 'Any'}</span>
          </div>
        </div>

        <div className="bg-[#f0ede8]/5 rounded-xl p-5 mb-6 text-center border border-[#f0ede8]/10">
          <h3 className="font-medium text-sm mb-2 text-[#c8b99a]">Pay with your AI Agent</h3>
          <p className="text-xs text-[#f0ede8]/60 leading-relaxed mb-4 text-balance">
            Copy the prompt below and paste it into ChatGPT, Claude, or OpenClaw to autonomously send a payment.
            <br/><span className="text-[10px] text-[#7ec898]/70 mt-1 block font-medium">Direct handle-to-handle payments require USDC or USDT on Base.</span>
          </p>
          <div className="bg-[#000000] p-3 rounded-lg text-left overflow-x-auto border border-[#f0ede8]/10 mb-4">
            <code className="text-xs text-[#7ec898] whitespace-pre">
              &quot;Pay 5 USDC to @{merchant.merchantId} for a coffee&quot;
            </code>
          </div>

          <div className="border-t border-[#f0ede8]/10 pt-4 mt-4 text-left">
            <h4 className="text-xs font-semibold text-[#f0ede8]/80 mb-3 uppercase tracking-wide">Agent Setup</h4>
            <div className="flex flex-col gap-2">
              <a href="/delegare.mcpb" download className="flex items-center gap-2 text-xs bg-[#f0ede8]/5 hover:bg-[#f0ede8]/10 text-[#f0ede8] py-2.5 px-3 rounded-lg border border-[#f0ede8]/10 transition-colors cursor-pointer no-underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Install for Claude Desktop (1-Click)
              </a>
              <button 
                onClick={() => setShowChatGptModal(true)}
                className="w-full flex items-center gap-2 text-xs bg-[#f0ede8]/5 hover:bg-[#f0ede8]/10 text-[#f0ede8] py-2.5 px-3 rounded-lg border border-[#f0ede8]/10 transition-colors cursor-pointer text-left"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                ChatGPT Manual Setup
              </button>
            </div>
          </div>
        </div>

        <div className="text-center space-y-3">
          <p className="text-xs text-[#f0ede8]/40">Don&apos;t have an agent budget set up yet?</p>
          <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://app.delegare.dev'}/setup?merchant=${merchant.merchantId}`} className="block w-full py-3 px-4 bg-[#c8b99a] hover:bg-[#d9ccaf] text-[#0c0c0c] rounded-xl text-sm font-semibold transition-colors no-underline">
            Connect your Agent
          </a>
          {!merchant.walletAddress && (
            <a href="https://www.coinbase.com/wallet" target="_blank" rel="noreferrer" className="block w-full py-2 px-4 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-xl text-[11px] transition-colors no-underline">
              New to crypto? Get a Coinbase Wallet
            </a>
          )}
        </div>
      </div>

      {showChatGptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-md w-full bg-[#111111] border border-[#f0ede8]/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
            <button 
              onClick={() => setShowChatGptModal(false)}
              className="absolute top-4 right-4 text-[#f0ede8]/30 hover:text-[#f0ede8] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-[10px] font-bold">GPT</span>
              ChatGPT Setup
            </h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-[#c8b99a]/20 text-[#c8b99a] rounded-full flex items-center justify-center text-[11px] font-bold">1</div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Enable Developer Mode</h4>
                  <p className="text-xs text-[#f0ede8]/50">Go to <strong>Settings</strong> → <strong>Apps</strong> and enable <strong>Developer mode</strong>.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-[#c8b99a]/20 text-[#c8b99a] rounded-full flex items-center justify-center text-[11px] font-bold">2</div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Add the MCP Server</h4>
                  <p className="text-xs text-[#f0ede8]/50">Click <strong>Add app</strong> and paste the URL below:</p>
                  <div className="mt-3 bg-black border border-white/10 rounded-lg p-2 flex items-center gap-2">
                    <code className="text-[11px] text-[#7ec898] flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{mcpUrl}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(mcpUrl);
                      }}
                      className="p-1.5 hover:bg-white/5 rounded text-[#f0ede8]/40 hover:text-[#f0ede8] transition-colors"
                      title="Copy URL"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 bg-[#c8b99a]/20 text-[#c8b99a] rounded-full flex items-center justify-center text-[11px] font-bold">3</div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Start a conversation</h4>
                  <p className="text-xs text-[#f0ede8]/50">Open a new chat, click the <span className="text-white">+</span> button, select <strong>Delegare</strong>, and say <em>&quot;list all tools&quot;</em>.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center">
              <a 
                href="https://docs.delegare.dev/sdk-tools/mcp-tools" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[11px] text-[#c8b99a] hover:underline flex items-center gap-1 no-underline"
              >
                View full documentation
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
              </a>
              <button 
                onClick={() => setShowChatGptModal(false)}
                className="px-4 py-2 bg-[#c8b99a] hover:bg-[#d9ccaf] text-[#0c0c0c] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center"><p className="text-[#f0ede8]/50">Loading...</p></div>}>
      <ProfileContent />
    </Suspense>
  );
}