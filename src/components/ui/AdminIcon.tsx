import { cn } from "@/lib/utils";

/** Line-icon set for the admin sidebar and stat tiles. */
const paths: Record<string, string> = {
  overview: "M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6V11h-6v9Zm0-16v5h6V4h-6Z",
  users: "M8 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3 20c0-3 2.5-5 5-5s5 2 5 5M13 20c0-2.5 2-4.5 4.5-4.5S21 17.5 21 20",
  mail: "M4 6h16v12H4V6Zm0 0 8 7 8-7",
  tag: "M4 4h8l8 8-8 8-8-8V4Zm4 4h.01",
  image: "M4 5h16v14H4V5Zm3 10 4-4 3 3 3-4 3 5H7Zm2-7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z",
  bell: "M18 16v-5a6 6 0 1 0-12 0v5l-2 2h16l-2-2Zm-9 2a3 3 0 0 0 6 0",
  wallet: "M3 7h15a3 3 0 0 1 3 3v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 0a2 2 0 0 1 2-2h11M16 13h3",
  logout: "M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 16l4-4-4-4M20 12H9",
  chevron: "M9 6l6 6-6 6",
  check: "M5 12.5l4.5 4.5L19 7",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 16-5.6-5.6",
  invoice: "M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 11h6M9 14h4",
  cart: "M3 4h2l2.4 11h10.2L20 7H6.2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8c0-3.5 3-6 7-6s7 2.5 7 6",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  calendar: "M5 5h14v15H5V5Zm0 5h14M9 3v4m6-4v4",
  sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4",
  percent: "M19 5 5 19M7 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  pie: "M12 3v9h9a9 9 0 1 1-9-9Zm3-.5A9 9 0 0 1 21.5 9H15V2.5Z",
  download: "M12 4v11m0 0-4-4m4 4 4-4M5 20h14",
};

export function AdminIcon({
  icon,
  className,
}: {
  icon: string;
  className?: string;
}) {
  const d = paths[icon] ?? paths.overview;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
