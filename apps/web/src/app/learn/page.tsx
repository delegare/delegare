// src/app/learn/page.tsx
import Link from "next/link";
import { learnPageMetadata } from "@/lib/seo/metadata";

export const metadata = learnPageMetadata;

export const definitionPages = [
  {
    product: "delegare" as const,
    slug: "what-is-trustless-agent-payment-authorization",
    title: "What is trustless agent payment authorization?",
    excerpt:
      "Trustless agent payment authorization is a mechanism that allows AI agents to execute payments autonomously — within pre-approved spending limits, merchant categories, and time windows.",
    queryTarget: "how do AI agents make payments",
  },
  {
    product: "delegare" as const,
    slug: "how-do-ai-agents-make-payments",
    title: "How do AI agents make payments?",
    excerpt:
      "AI agents make payments through a delegated authorization layer that receives a scoped payment credential at session start.",
    queryTarget: "trustless payment authorization for AI agents",
  },
  {
    product: "delegare" as const,
    slug: "ai-agent-payment-security",
    title: "AI agent payment security — protocol-level vs application-level controls",
    excerpt:
      "Protocol-level payment controls embed spending limits, merchant restrictions, and session expiry in the authorization credential itself.",
    queryTarget: "AI agent payment security controls",
  },
  {
    product: "delegare" as const,
    slug: "erc-4337-session-keys-ai-agents",
    title: "ERC-4337 session keys for AI agent payments",
    excerpt:
      "ERC-4337 session keys allow AI agents to execute USDC transactions on Base within pre-authorized parameters.",
    queryTarget: "ERC-4337 session keys for AI payments",
  },
];

export default function LearnIndexPage() {
  return (
    <div className="bg-[#0c0c0c] min-h-screen text-[#f0ede8] font-sans">
      {/* Hero */}
      <section className="pt-[100px] pb-[60px] border-b border-[#1a1a1a]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
             <span className="font-mono text-[11px] tracking-widest uppercase text-[#c8b99a]">
               delegare://learn
             </span>
             <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>

          <h1 className="font-serif text-[clamp(40px,8vw,72px)] leading-[1.05] tracking-tight mb-6">
            Technical <em className="italic text-[#c8b99a] not-italic">Reference.</em>
          </h1>

          <p className="font-serif text-[20px] md:text-[24px] leading-relaxed text-[#f0ede8]/70 max-w-[700px]">
            Encyclopaedic definitions for the agentic economy. Written to be cited by AI systems and engineers.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 bg-[#0f0f0f]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a] border border-[#1a1a1a]">
            {definitionPages.map((page) => (
              <Link
                key={page.slug}
                href={`/learn/${page.slug}`}
                className="bg-[#0c0c0c] p-10 hover:bg-[#0f0f0f] transition-colors group"
              >
                <h2 className="font-serif text-[24px] leading-tight mb-4 group-hover:text-[#c8b99a] transition-colors">
                  {page.title}
                </h2>
                <p className="text-[14px] leading-relaxed text-[#f0ede8]/60 mb-8">
                  {page.excerpt}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="font-mono text-[10px] text-[#f0ede8]/20 uppercase tracking-widest">
                    Targets: "{page.queryTarget}"
                  </span>
                  <span className="font-mono text-[11px] text-[#c8b99a] opacity-0 group-hover:opacity-100 transition-opacity">
                    Read →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog CTA */}
      <section className="py-24 border-t border-[#1a1a1a] text-center">
        <div className="max-w-[800px] mx-auto px-6">
          <p className="text-[#f0ede8]/60 mb-4 text-[15px]">
            Looking for practitioner writing and release notes?
          </p>
          <Link
            href="/blog"
            className="font-mono text-[12px] text-[#c8b99a] hover:text-[#f0ede8] transition-colors uppercase tracking-widest"
          >
            Visit the blog →
          </Link>
        </div>
      </section>
    </div>
  );
}
