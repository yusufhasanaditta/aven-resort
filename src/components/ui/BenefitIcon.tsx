import { cn } from "@/lib/utils";

/** Line-icon set for the ownership benefits grid, keyed to `data/ownership.ts`'s `icon` field. */
const paths: Record<string, string> = {
  document: "M7 3h7l4 4v14H7V3Zm7 0v4h4M9 12h6M9 15h6M9 9h2",
  building: "M4 21V7l6-4 6 4v14M4 21h16M9 21v-5h4v5M9 10h.01M13 10h.01M9 14h.01M13 14h.01",
  chart: "M4 20V10M10 20V4M16 20v-7M4 20h16",
  exchange: "M6 7h11l-3-3M18 17H7l3 3M6 7v4M18 17v-4",
  infinity: "M7 9a3 3 0 1 0 0 6c2 0 3-1.5 5-3s3-3 5-3a3 3 0 1 1 0 6c-2 0-3-1.5-5-3s-3-3-5-3Z",
  users: "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3 2.5-5 5-5s5 2 5 5M13 20c0-2.5 2-4.5 4.5-4.5S21 17.5 21 20",
  key: "M15 7a4 4 0 1 0-3.9 5H3v3h2v3h3v-3h2.1A4 4 0 0 0 15 7Zm0 0h.01",
  tag: "M4 4h8l8 8-8 8-8-8V4Zm4 4h.01",
};

export function BenefitIcon({
  icon,
  color = "currentColor",
  className,
}: {
  icon: string;
  color?: string;
  className?: string;
}) {
  const d = paths[icon] ?? paths.tag;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
