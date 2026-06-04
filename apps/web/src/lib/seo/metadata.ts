import type { Metadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://delegare.dev";

interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath: string;
  noIndex?: boolean;
}

export function generatePageMetadata(config: PageMetadataConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonicalPath,
    noIndex = false,
  } = config;

  const fullTitle = title.includes("Delegare")
    ? title
    : `${title} | Delegare`;

  const canonicalUrl = `${baseUrl}${canonicalPath}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(", "),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: "Delegare",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@delegare_dev",
      creator: "@delegare_dev",
      title: fullTitle,
      description,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

export const blogPageMetadata = generatePageMetadata({
  title: "Blog — Agentic Payments & Trustless Authorization",
  description: "Practitioner writing on AI agent payments, trustless authorization, and the future of the agentic economy.",
  canonicalPath: "/blog",
});

export const learnPageMetadata = generatePageMetadata({
  title: "Learn — Definitions for Agentic Payments",
  description: "Encyclopaedic definitions for agentic payments, trustless authorization, and session keys.",
  canonicalPath: "/learn",
});
