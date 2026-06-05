// src/lib/contentful/client.ts
import { createClient, type EntrySkeletonType } from "contentful";

export type BlogProduct = "los" | "agents" | "mcp" | "delegare" | "general";

export interface BlogPostFields {
  title: string;
  slug: string;
  excerpt: string;
  body: any;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  product?: BlogProduct;
  tags?: string[];
  coverImage?: {
    fields: {
      file: { url: string; details: { image: { width: number; height: number } } };
      title: string;
    };
  };
  canonicalUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: "blogPost";
  fields: BlogPostFields;
}

export interface BlogPost {
  id: string;
  fields: BlogPostFields;
}

function getClient(preview = false) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const token = preview
    ? process.env.CONTENTFUL_PREVIEW_TOKEN
    : process.env.CONTENTFUL_ACCESS_TOKEN;
  const environment = process.env.CONTENTFUL_ENVIRONMENT || "master";

  if (!spaceId || !token) {
    // Return a dummy client or throw during dev if needed
    // For build safety, we'll return a minimal object that won't crash if called
    return createClient({
      space: spaceId || "dummy",
      accessToken: token || "dummy",
      environment,
      ...(preview && { host: "preview.contentful.com" }),
    });
  }

  return createClient({
    space: spaceId,
    accessToken: token,
    environment,
    ...(preview && { host: "preview.contentful.com" }),
  });
}

function normalizePost(entry: any): BlogPost {
  return {
    id: entry.sys.id,
    fields: entry.fields as BlogPostFields,
  };
}

// Sort newest-first in JS — the contentful v11 typed client rejects
// `order: ["-fields.publishedAt"]` on an `<any>` skeleton (validation throws
// before the request), which silently emptied the list.
const byPublishedDesc = (a: BlogPost, b: BlogPost) =>
  (b.fields.publishedAt || "").localeCompare(a.fields.publishedAt || "");

export async function getAllPosts(preview = false): Promise<BlogPost[]> {
  try {
    const client = getClient(preview);
    const entries = await client.getEntries<any>({
      content_type: "blogPost",
      limit: 100,
    });
    return entries.items.map(normalizePost).sort(byPublishedDesc);
  } catch (e) {
    console.error("Contentful error:", e);
    return [];
  }
}

export async function getPostBySlug(
  slug: string,
  preview = false
): Promise<BlogPost | null> {
  try {
    const client = getClient(preview);
    const entries = await client.getEntries<any>({
      content_type: "blogPost",
      "fields.slug": slug,
      limit: 1,
    });
    if (!entries.items.length) return null;
    return normalizePost(entries.items[0]);
  } catch (e) {
    console.error("Contentful error:", e);
    return null;
  }
}

export async function getPostsByProduct(
  product: BlogProduct,
  preview = false
): Promise<BlogPost[]> {
  try {
    const client = getClient(preview);
    const entries = await client.getEntries<any>({
      content_type: "blogPost",
      "fields.product": product,
      limit: 20,
    });
    return entries.items.map(normalizePost).sort(byPublishedDesc);
  } catch (e) {
    console.error("Contentful error:", e);
    return [];
  }
}

export const productLabels: Record<BlogProduct, string> = {
  los: "AI-Native LOS",
  agents: "AI Origination Agents",
  mcp: "Financial MCP Server",
  delegare: "Delegare",
  general: "SecureLend",
};
