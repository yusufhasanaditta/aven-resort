import { cn } from "@/lib/utils";

/**
 * Line pictograms for the 20 amenities, redrawn from the white-on-gold icon
 * tiles on the brochure's "Site Zoning & Functions" page. 32×32 grid,
 * stroke-only, so they take `currentColor` on any tile.
 */
const paths: Record<string, React.ReactNode> = {
  hotel: (
    <>
      <path d="M8 28V9h16v19M5 28h22M12 13h2m4 0h2m-8 4h2m4 0h2m-8 4h2m4 0h2M14 28v-4h4v4" />
      <path d="m16 3.2.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L13.1 5.3l2-.3Z" />
    </>
  ),
  villa: (
    <>
      <path d="M4 28h24M6 28V15l8-6 8 6v13M10 28v-6h4v6M16 18h3v3h-3z" />
      <circle cx="25" cy="17" r="3" />
      <path d="M25 20v8" />
    </>
  ),
  pool: (
    <>
      <path d="M11 20V7a3 3 0 0 1 6 0M19 20V7a3 3 0 0 1 6 0M11 11h8M11 15h8" />
      <path d="M4 23c2 0 2 1.5 4 1.5S10 23 12 23s2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M4 27.5c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" />
    </>
  ),
  wellness: (
    <>
      <circle cx="16" cy="10" r="2.2" />
      <path d="M16 12.5V21m0 0-3 7m3-7 3 7M9 9l7 5 7-5" />
      <path d="M6 5.5c0-1.4 1-2.5 1-2.5s1 1.1 1 2.5-1 2-1 2-1-.6-1-2Zm18 0c0-1.4 1-2.5 1-2.5s1 1.1 1 2.5-1 2-1 2-1-.6-1-2ZM15 3c0-1 1-2 1-2s1 1 1 2-1 1.5-1 1.5S15 4 15 3Z" />
    </>
  ),
  restaurant: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M11 9v5a2 2 0 0 0 4 0V9m-2 0v14M21 9c-1.8 1-2.5 3-2.5 5.5H21V23" />
    </>
  ),
  conference: (
    <>
      <rect x="6" y="4" width="20" height="11" rx="1" />
      <path d="M16 15v3M8 21h16M11 21v7m10-7v7M6 25h3m14 0h3" />
    </>
  ),
  lawn: (
    <>
      <path d="M4 12c3-6 21-6 24 0H4ZM16 6V4M16 12v16M9 20h14M11 20l-2 8m12-8 2 8" />
      <path d="M4 28h24" />
    </>
  ),
  stage: (
    <>
      <path d="M4 26c0-7 5.5-12 12-12s12 5 12 12" />
      <path d="M8 26c0-5 3.5-8.5 8-8.5s8 3.5 8 8.5" />
      <path d="M12 26c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5M3 26h26" />
      <path d="M16 8V4m-6 5.5L8 7m14 2.5L24 7" />
    </>
  ),
  prayer: (
    <>
      <path d="M8 28V14a8 8 0 0 1 16 0v14M5 28h22" />
      <path d="M16 3v3" />
      <circle cx="16" cy="15" r="2" />
      <path d="M13 26v-3.5c0-2 1.3-3.5 3-3.5s3 1.5 3 3.5V26" />
    </>
  ),
  camp: (
    <>
      <path d="m4 26 11-18 11 18H4ZM15 8v18M15 18l5 8" />
      <path d="M19 6l3-3M22 8h3M2 28h28" />
    </>
  ),
  kayak: (
    <>
      <path d="M4 20c4 2 20 2 24 0-4-1.5-20-1.5-24 0Z" />
      <circle cx="15" cy="9" r="2" />
      <path d="M15 11v7M10 21 24 5" />
      <path d="M4 26c2 0 2 1.5 4 1.5s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5" />
    </>
  ),
  turf: (
    <>
      <rect x="3" y="7" width="26" height="18" rx="1" />
      <path d="M16 7v18" />
      <circle cx="16" cy="16" r="3.5" />
      <path d="M3 12h4v8H3m26-8h-4v8h4" />
    </>
  ),
  walkway: (
    <>
      <path d="M6 29c0-5 5-5 5-10s-6-5-6-10 4-6 4-6" />
      <path d="M11 29c0-5 5-5 5-10s-6-5-6-10 4-6 4-6" strokeDasharray="1.5 2" />
      <circle cx="23" cy="10" r="2" />
      <path d="M23 12v7l-2.5 8M23 19l3 8M20 15h6" />
    </>
  ),
  kids: (
    <>
      <path d="M18 28V10l4-5 4 5v18M18 14h8M18 19h8M18 24h8" />
      <path d="M18 11C14 13 11 18 9 22s-4 4-6 4" />
      <path d="M18 15c-3.5 2-6 6-8 10" />
    </>
  ),
  library: (
    <>
      <path d="M4 26h24M5 22h17v4H5zM6 18h16v4H6zM5 14h17v4H5z" />
      <path d="m23 26 3-17 2.5.5-3 16.5" />
    </>
  ),
  treehouse: (
    <>
      <path d="M16 29V21M13 29h6" />
      <path d="M10 21c-4 0-6-3-6-6 0-3 2-5 4-5 0-4 4-7 8-7s8 3 8 7c2 0 4 2 4 5 0 3-2 6-6 6H10Z" />
      <path d="M11 18v-5l5-3.5 5 3.5v5h-10ZM15 18v-3h2v3" />
    </>
  ),
  bbq: (
    <>
      <path d="M5 13h22a11 7 0 0 1-22 0Z" />
      <path d="M5 13h22M11 20l-3 8m13-8 3 8M16 21v5" />
      <circle cx="16" cy="27" r="1.5" />
      <path d="M11 3c1 1.5-1 2.5 0 4m5-4c1 1.5-1 2.5 0 4m5-4c1 1.5-1 2.5 0 4" />
    </>
  ),
  farm: (
    <>
      <path d="M16 19V9M16 13c-3 0-5-2-5-5 3 0 5 2 5 5Zm0-2c0-3 2-5 5-5 0 3-2 5-5 5Z" />
      <path d="M4 20c3 0 5 1 7 3l5 3 5-3c2-2 4-3 7-3M4 20v6h4M28 20v6h-4" />
    </>
  ),
  helipad: (
    <>
      <circle cx="16" cy="16" r="12" />
      <path d="M11.5 10v12m9-12v12M11.5 16h9" />
    </>
  ),
  parking: (
    <>
      <rect x="18" y="3" width="10" height="10" rx="2" />
      <path d="M21.5 10.5v-5h2a1.6 1.6 0 0 1 0 3.2h-2M23 13v15" />
      <path d="M4 25v-4l2-5h10l2 5v4H4ZM4 25v2.5h3V25m8 0v2.5h3V25M4 21h14" />
      <circle cx="7.5" cy="22.5" r=".6" />
      <circle cx="14.5" cy="22.5" r=".6" />
    </>
  ),
};

export function AmenityIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      {paths[icon] ?? paths.hotel}
    </svg>
  );
}
