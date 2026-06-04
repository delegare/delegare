// src/app/learn/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { definitionPages } from "../page";
import { generatePageMetadata } from "@/lib/seo/metadata";

// Static imports for all MDX content
import WhatIsTrustlessAuth from "@/content/learn/what-is-trustless-agent-payment-authorization.mdx";
import HowAiAgentsPay from "@/content/learn/how-do-ai-agents-make-payments.mdx";
import AiPaymentSecurity from "@/content/learn/ai-agent-payment-security.mdx";
import Erc4337SessionKeys from "@/content/learn/erc-4337-session-keys-ai-agents.mdx";

const mdxComponents: Record<string, any> = {
  "what-is-trustless-agent-payment-authorization": WhatIsTrustlessAuth,
  "how-do-ai-agents-make-payments": HowAiAgentsPay,
  "ai-agent-payment-security": AiPaymentSecurity,
  "erc-4337-session-keys-ai-agents": Erc4337SessionKeys,
};

export async function generateStaticParams() {
  return definitionPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pageInfo = definitionPages.find((p) => p.slug === slug);
  if (!pageInfo) return {};

  return generatePageMetadata({
    title: pageInfo.title,
    description: pageInfo.excerpt,
    canonicalPath: `/learn/${slug}`,
  });
}

export default async function LearnDefinitionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pageInfo = definitionPages.find((p) => p.slug === slug);
  const MdxContent = mdxComponents[slug];

  if (!pageInfo || !MdxContent) notFound();

  return (
    <div className="bg-[#0c0c0c] min-h-screen text-[#f0ede8] font-sans">
      {/* Back nav */}
      <div className="border-b border-[#1a1a1a] bg-[#0c0c0c]/80 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[800px] mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-[12px] font-mono text-[#f0ede8]/40 hover:text-[#c8b99a] transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="h-3 w-3" />
            Index
          </Link>
          <span className="font-mono text-[10px] text-[#f0ede8]/20 uppercase tracking-widest">
            Delegare Protocol Intelligence
          </span>
        </div>
      </div>

      <article className="pt-16 pb-24 px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Header Meta */}
          <div className="flex items-center gap-4 mb-8">
            <span className="font-mono text-[11px] text-[#c8b99a] uppercase tracking-widest">
              Core Definition
            </span>
            <div className="h-px w-8 bg-[#1a1a1a]" />
          </div>

          {/* Title */}
          <h1 className="font-serif text-[clamp(32px,6vw,52px)] font-medium leading-[1.1] tracking-tight mb-8 text-white">
            {pageInfo.title}
          </h1>

          {/* Excerpt */}
          <p className="font-serif italic text-[22px] leading-relaxed text-[#f0ede8]/70 mb-12 border-l border-[#c8b99a]/30 pl-8 py-2">
            {pageInfo.excerpt}
          </p>

          {/* Content Body */}
          <div className="prose prose-invert max-w-none prose-p:text-[#f0ede8]/80 prose-headings:font-serif prose-headings:font-medium prose-headings:text-white prose-strong:text-white prose-code:text-[#c8b99a] prose-code:bg-[#1a1a1a] prose-code:px-1 prose-code:rounded">
            <MdxContent />
          </div>

          {/* Flywheel Footer */}
          <div className="mt-24 p-10 bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#c8b99a]/20 group-hover:bg-[#c8b99a] transition-colors" />
            <div className="flex items-start gap-6">
              <div className="p-3 rounded-lg bg-[#0c0c0c] border border-[#1a1a1a] group-hover:border-[#c8b99a]/30 transition-colors">
                <BookOpen className="h-6 w-6 text-[#c8b99a]" />
              </div>
              <div>
                <h3 className="font-serif text-[24px] font-medium text-white mb-2">
                  Technical Docs
                </h3>
                <p className="text-[15px] text-[#f0ede8]/60 leading-relaxed mb-6">
                  Ready to implement trustless payments? Explore our developer guide or join the waitlist for mainnet access.
                </p>
                <Link 
                  href="/login"
                  className="font-mono text-[12px] text-[#c8b99a] hover:text-white transition-colors border-b border-[#c8b99a]/30 pb-0.5"
                >
                  Get started →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
