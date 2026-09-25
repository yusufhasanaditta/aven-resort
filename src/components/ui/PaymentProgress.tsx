import { cn } from "@/lib/utils";

export type ProgressStep = {
  label: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "CANCELLED" | "UPCOMING";
};

/**
 * A segmented progress stepper for an instalment plan — paid steps fill
 * solid, the current one pulses, the rest sit as open track. Reads at a
 * glance in a way a bare list of "PENDING / SUCCESS" labels doesn't.
 */
export function PaymentProgress({ steps }: { steps: ProgressStep[] }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`${steps.filter((s) => s.status === "SUCCESS").length} of ${steps.length} instalments paid`}>
      {steps.map((step, i) => (
        <span
          key={i}
          title={`${step.label}: ${step.status === "UPCOMING" ? "not yet due" : step.status}`}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            step.status === "SUCCESS" && "bg-forest-600",
            step.status === "PENDING" && "bg-gold-500 animate-pulse",
            step.status === "FAILED" && "bg-red-400",
            (step.status === "UPCOMING" || step.status === "CANCELLED") &&
              "bg-forest-600/12",
          )}
        />
      ))}
    </div>
  );
}
