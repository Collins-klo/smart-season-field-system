import { Loader2 } from "lucide-react";

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-primary)] mb-4" />
      <p className="text-sm text-[var(--color-text-muted)]">{text}</p>
    </div>
  );
}
