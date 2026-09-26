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
      {
        // Experiences became the 20-amenity tour from the brochure.
        source: "/experiences",
        destination: "/amenities",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
