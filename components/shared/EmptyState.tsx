import { FileX2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({ title, description, className }: { title: string, description: string, className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg border-dashed", className)}>
      <div className="bg-[var(--color-surface-muted)] p-3 rounded-full mb-4">
        <FileX2 className="w-8 h-8 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-heading font-medium text-[var(--color-text-primary)] mb-1">{title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">{description}</p>
    </div>
  );
}
