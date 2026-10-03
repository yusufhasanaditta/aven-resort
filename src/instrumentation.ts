/**
 * Runs once when the server starts: loads the page editor's edits so the very
 * first page served already shows them (see src/lib/site-edits.ts).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { reloadSiteEdits } = await import("@/lib/site-edits");
    await reloadSiteEdits();
  }
}
