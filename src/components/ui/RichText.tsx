import { cn } from "@/lib/utils";

/**
 * Renders the CMS's plain-text format: `## ` starts a heading, `- ` a bullet,
 * blank lines separate paragraphs. Deliberately tiny — no HTML is ever
 * interpreted, so content edited in the admin panel can't inject markup.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className={cn("space-y-4", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim());
        if (!lines.length) return null;
        return (
          <div key={i} className="space-y-3">
            {groupLines(lines).map((g, j) =>
              g.type === "h" ? (
                <h2 key={j} className="pt-2 font-display text-2xl text-forest-900">
                  {g.lines[0]}
                </h2>
              ) : g.type === "ul" ? (
                <ul key={j} className="list-disc space-y-1.5 pl-5 text-[0.9375rem] leading-relaxed text-forest-900/70 marker:text-forest-600/50">
                  {g.lines.map((l, k) => (
                    <li key={k}>{l}</li>
                  ))}
                </ul>
              ) : (
                <p key={j} className="text-pretty text-[0.9375rem] leading-relaxed text-forest-900/70">
                  {g.lines.join(" ")}
                </p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}

function groupLines(lines: string[]) {
  const out: { type: "h" | "ul" | "p"; lines: string[] }[] = [];
  for (const raw of lines) {
    const l = raw.trim();
    const type = l.startsWith("## ") ? "h" : l.startsWith("- ") ? "ul" : "p";
    const text = type === "h" ? l.slice(3) : type === "ul" ? l.slice(2) : l;
    const last = out[out.length - 1];
    if (last && last.type === type && type !== "h") last.lines.push(text);
    else out.push({ type, lines: [text] });
  }
  return out;
}
