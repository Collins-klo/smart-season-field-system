import { Field, FieldUpdate } from "@prisma/client";
import { computeFieldStatus } from "@/lib/field-status";
import { FieldStage } from "@/types";
import { FieldCard } from "../fields/FieldCard";
import { EmptyState } from "../shared/EmptyState";

type FieldWithUpdates = Field & { updates: FieldUpdate[] };

export function AgentDashboard({ fields, user }: { fields: FieldWithUpdates[], user: any }) {
  const getFieldsByStage = (stage: FieldStage) => {
    return fields.filter(f => f.stage === stage);
  };

  const columns = [
    { title: "Planted", stage: FieldStage.PLANTED, data: getFieldsByStage(FieldStage.PLANTED) },
    { title: "Growing", stage: FieldStage.GROWING, data: getFieldsByStage(FieldStage.GROWING) },
    { title: "Ready", stage: FieldStage.READY, data: getFieldsByStage(FieldStage.READY) },
    { title: "Harvested", stage: FieldStage.HARVESTED, data: getFieldsByStage(FieldStage.HARVESTED) },
  ];

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-[var(--color-text-primary)]">
          Good morning, {user?.name?.split(' ')[0] || "Agent"}
        </h2>
        <p className="text-[var(--color-text-secondary)] text-sm">{today}</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max h-full">
          {columns.map(col => (
            <div key={col.stage} className="w-80 flex flex-col bg-[var(--color-surface-muted)] rounded-xl border border-[var(--color-border)]">
              <div className="p-3 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)] rounded-t-xl">
                <h3 className="font-medium text-[var(--color-text-primary)]">{col.title}</h3>
                <span className="bg-[var(--color-brand-xlight)] text-[var(--color-brand-primary)] text-xs font-bold px-2 py-0.5 rounded-full">
                  {col.data.length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {col.data.length > 0 ? (
                  col.data.map(field => (
                    <FieldCard key={field.id} field={field} />
                  ))
                ) : (
                  <div className="pt-4 text-center text-sm text-[var(--color-text-muted)]">
                    No fields here.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
