// src/app/blog/page.tsx
import Link from "next/link";
import { getAllPosts } from "@/lib/contentful/client";
import { blogPageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils";

export const metadata = blogPageMetadata;
export const revalidate = 600;

export default async function BlogPage() {
  // We filter by 'delegare' product to keep the blog focused
  let posts = await getAllPosts().catch(() => []);
  posts = posts.filter((p) => p.fields.product === "delegare");

  return (
    <div className="bg-[#0c0c0c] min-h-screen text-[#f0ede8] font-sans">
      {/* Hero */}
      <section className="pt-[100px] pb-[60px] border-b border-[#1a1a1a]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="flex items-center gap-4 mb-6">
             <span className="font-mono text-[11px] tracking-widest uppercase text-[#c8b99a]">
               delegare://blog
             </span>
             <div className="h-px flex-1 bg-[#1a1a1a]" />
          </div>

          <h1 className="font-serif text-[clamp(40px,8vw,72px)] leading-[1.05] tracking-tight mb-6">
            Agentic <em className="italic text-[#c8b99a] not-italic">Payments.</em>
          </h1>

          <p className="font-serif text-[20px] md:text-[24px] leading-relaxed text-[#f0ede8]/70 max-w-[700px]">
            Technical writing on trustless authorization, scoped credentials, 
            and giving AI agents real spending power.
          </p>
        </div>
      </section>

      {/* Posts */}
      <section className="py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          {posts.length === 0 ? (
            <div className="py-20 border border-dashed border-[#1a1a1a] rounded-xl text-center">
              <p className="font-mono text-[12px] text-[#f0ede8]/40 uppercase tracking-widest">
                No articles published yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1a1a1a] border border-[#1a1a1a]">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.fields.slug}`}
                  className="bg-[#0c0c0c] p-10 hover:bg-[#0f0f0f] transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="font-mono text-[10px] text-[#f0ede8]/40 uppercase tracking-widest">
                      {formatDate(post.fields.publishedAt)}
                    </span>
                  </div>
                  <h2 className="font-serif text-[28px] leading-tight mb-4 group-hover:text-[#c8b99a] transition-colors">
                    {post.fields.title}
                  </h2>
                  <p className="text-[15px] leading-relaxed text-[#f0ede8]/60 mb-8 line-clamp-3">
                    {post.fields.excerpt}
                  </p>
                  <div className="font-mono text-[11px] text-[#c8b99a] border-b border-[#c8b99a]/30 pb-0.5 inline-block">
                    Read article →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Learn CTA */}
      <section className="py-24 border-t border-[#1a1a1a] text-center">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="font-serif text-[32px] mb-4">Want the definitions?</h2>
          <p className="text-[#f0ede8]/60 mb-8 max-w-[500px] mx-auto text-[16px]">
            Visit our learning center for encyclopaedic reference pages on agentic payments.
          </p>
          <Link
            href="/learn"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-[#f0ede8] px-8 text-[14px] font-medium text-black hover:bg-[#f0ede8]/90 transition-colors"
          >
            Go to Learn
          </Link>
        </div>
      </section>
    </div>
  );
}
