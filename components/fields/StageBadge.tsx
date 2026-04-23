import { FieldStage } from "@/types";
import { cn } from "@/lib/utils";
import { Leaf, Sprout, Wheat, CheckSquare } from "lucide-react";

export function StageBadge({ stage }: { stage: FieldStage }) {
  const config = {
    [FieldStage.PLANTED]: { label: "Planted", icon: Leaf, className: "bg-[var(--color-brand-xlight)] text-[var(--color-brand-primary)]" },
    [FieldStage.GROWING]: { label: "Growing", icon: Sprout, className: "bg-[var(--color-brand-light)] text-[var(--color-brand-primary)]" },
    [FieldStage.READY]: { label: "Ready", icon: Wheat, className: "bg-[var(--color-earth-sand)] text-[var(--color-earth-brown)]" },
    [FieldStage.HARVESTED]: { label: "Harvested", icon: CheckSquare, className: "bg-[var(--color-status-completed-bg)] text-[var(--color-status-completed)]" },
  };

  const { label, icon: Icon, className } = config[stage];

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium gap-1 uppercase tracking-wider", className)}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}
