"use client";

import { ButtonAction } from "@/components/ui/Button";
import { AdminIcon } from "@/components/ui/AdminIcon";

/** Opens the browser print dialog — "Save as PDF" there is the invoice download. */
export function PrintButton() {
  return (
    <ButtonAction size="sm" onClick={() => window.print()}>
      <AdminIcon icon="download" className="h-4 w-4" />
      Download / print
    </ButtonAction>
  );
}
