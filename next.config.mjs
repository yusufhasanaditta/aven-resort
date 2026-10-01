// Plain JavaScript on purpose: Hostinger's shared servers can't run the
// compiler Next.js needs to read a TypeScript config (next.config.ts).

/** @type {import('next').NextConfig} */
const nextConfig = {
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
