import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        // Membership and Ownership were merged into one page.
        source: "/membership",
        destination: "/ownership",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
