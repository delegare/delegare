import type { NextConfig } from "next";

// Shared security headers — see docs/concepts/security-model.mdx.
// Deny framing (clickjacking), block MIME sniffing, conservative referrer policy,
// and HSTS (1 year, includeSubDomains, preload-eligible).
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  async redirects() {
    const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://app.delegare.dev';
    return [
      {
        source: '/setup',
        destination: `${dashboardUrl}/setup`,
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
