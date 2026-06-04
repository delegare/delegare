// src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS } from "@contentful/rich-text-types";
import { getPostBySlug, getAllPosts } from "@/lib/contentful/client";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/utils";

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await getAllPosts().catch(() => []);
  return posts
    .filter((p) => p.fields.product === "delegare")
    .map((post) => ({ slug: post.fields.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);
  if (!post) return {};

  return generatePageMetadata({
    title: post.fields.seoTitle || post.fields.title,
    description: post.fields.seoDescription || post.fields.excerpt,
    canonicalPath: post.fields.canonicalUrl || `/blog/${post.fields.slug}`,
    keywords: post.fields.tags || [],
  });
}

const richTextOptions = {
  renderMark: {
    [MARKS.BOLD]: (text: React.ReactNode) => (
      <strong className="font-semibold text-white">{text}</strong>
    ),
    [MARKS.CODE]: (text: React.ReactNode) => (
      <code className="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[13px] font-mono text-[#c8b99a]">
        {text}
      </code>
    ),
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_: any, children: React.ReactNode) => (
      <p className="mb-6 leading-[1.7] text-[#f0ede8]/80 text-[17px]">{children}</p>
    ),
    [BLOCKS.HEADING_1]: (_: any, children: React.ReactNode) => (
      <h1 className="font-serif text-3xl font-medium mt-12 mb-6 text-white leading-tight">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_: any, children: React.ReactNode) => (
      <h2 className="font-serif text-2xl font-medium mt-10 mb-5 text-white leading-tight">{children}</h2>
    ),
    [BLOCKS.UL_LIST]: (_: any, children: React.ReactNode) => (
      <ul className="list-disc ml-6 mb-8 space-y-2 text-[#f0ede8]/80">{children}</ul>
    ),
    [BLOCKS.LIST_ITEM]: (_: any, children: React.ReactNode) => (
      <li className="pl-2">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_: any, children: React.ReactNode) => (
      <blockquote className="border-l-2 border-[#c8b99a] pl-8 italic text-[#f0ede8]/60 my-10 font-serif text-[20px]">
        {children}
      </blockquote>
    ),
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug).catch(() => null);

  if (!post) notFound();

  const { fields } = post;

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-[#f0ede8] font-sans pb-24">
      {/* Back nav */}
      <div className="border-b border-[#1a1a1a] bg-[#0c0c0c]/80 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[800px] mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[12px] font-mono text-[#f0ede8]/40 hover:text-[#c8b99a] transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="h-3 w-3" />
            Feed
          </Link>
          <span className="font-mono text-[10px] text-[#f0ede8]/20 uppercase tracking-widest">
            Delegare Protocol Intelligence
          </span>
        </div>
      </div>

      <article className="pt-16 px-6">
        <div className="max-w-[800px] mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <span className="font-mono text-[11px] text-[#c8b99a] uppercase tracking-widest">
              Technical Paper
            </span>
            <div className="h-px w-8 bg-[#1a1a1a]" />
            <div className="flex items-center gap-2 font-mono text-[11px] text-[#f0ede8]/40 uppercase tracking-widest">
              <Calendar className="h-3 w-3" />
              {formatDate(fields.publishedAt)}
            </div>
          </div>

          {/* Title */}
          <h1 className="font-serif text-[clamp(32px,6vw,52px)] font-medium leading-[1.1] tracking-tight mb-8 text-white">
            {fields.title}
          </h1>

          {/* Excerpt */}
          <p className="font-serif italic text-[22px] leading-relaxed text-[#f0ede8]/70 mb-12 border-l border-[#c8b99a]/30 pl-8 py-2">
            {fields.excerpt}
          </p>

          {/* Byline */}
          <div className="flex items-center gap-4 mb-12 py-6 border-t border-b border-[#1a1a1a]">
            <div className="flex items-center gap-2 text-[13px] text-[#f0ede8]/50">
              <User className="h-4 w-4" />
              <span>{fields.author || "Tobias Pfuetze"}</span>
            </div>
            <div className="flex-1" />
            <div className="font-mono text-[10px] text-[#f0ede8]/20 uppercase tracking-widest">
              Authoritative Reference
            </div>
          </div>

          {/* Body */}
          <div className="article-body">
            {documentToReactComponents(fields.body, richTextOptions)}
          </div>
        </div>
      </article>
    </div>
  );
}
