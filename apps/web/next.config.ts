import type { NextConfig } from "next";

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
};

export default nextConfig;
