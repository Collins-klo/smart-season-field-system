import { FieldStatus } from "@/lib/field-status";
import { cn } from "@/lib/utils";

const config: Record<FieldStatus, { label: string, className: string }> = {
  active: { label: "Active", className: "bg-[var(--color-status-active-bg)] text-[var(--color-status-active)]" },
  at_risk: { label: "At Risk", className: "bg-[var(--color-status-at-risk-bg)] text-[var(--color-status-at-risk)] focus:ring-[var(--color-status-at-risk)] focus:ring-offset-2 focus:ring-2" },
  completed: { label: "Completed", className: "bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed)]" },
};

export function StatusBadge({ status }: { status: FieldStatus }) {
  const { label, className } = config[status];
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", className)}>
      {label}
    </span>
  );
}
