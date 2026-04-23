import { FieldUpdate } from "@prisma/client";
import { format } from "date-fns";

type UpdateWithAgent = FieldUpdate & { agent: { name: string } | null };

export function FieldUpdateTimeline({ updates }: { updates: UpdateWithAgent[] }) {
  if (!updates || updates.length === 0) {
    return <div className="p-8 text-center text-sm text-[var(--color-text-muted)]">No updates logged yet.</div>;
  }

  // Sort by latest first
  const sorted = [...updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="relative border-l border-[var(--color-border)] ml-3 space-y-6 pb-4">
      {sorted.map((update, index) => {
        const isLatest = index === 0;
        const initals = update.agent?.name?.split(' ').map(n => n[0]).join('') || "U";

        return (
          <div key={update.id} className="relative pl-6">
            <div className={`absolute -left-3.5 top-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-[var(--color-surface)] ${isLatest ? 'bg-[var(--color-brand-primary)] text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-text-secondary)]'}`}>
              {initals}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
              <h4 className="font-medium text-[var(--color-text-primary)] text-sm">
                Status changed to <span className="uppercase text-[var(--color-brand-primary)] font-bold">{update.stage}</span>
              </h4>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">
                {format(new Date(update.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] mb-2">
              Logged by {update.agent?.name || "System"}
            </p>

            {update.notes && (
              <div className="bg-[var(--color-surface-muted)]/50 p-3 rounded-md border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] relative">
                {/* Speech bubble arrow */}
                <div className="absolute top-2 -left-[5px] w-2 h-2 bg-[var(--color-surface-muted)]/50 border-l border-t border-[var(--color-border)] transform -rotate-45"></div>
                {update.notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
