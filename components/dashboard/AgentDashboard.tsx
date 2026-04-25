import { Field, FieldUpdate } from "@prisma/client";
import { FieldStage } from "@/types";
import { FieldCard } from "../fields/FieldCard";

type FieldWithUpdates = Field & { updates: FieldUpdate[] };

export function AgentDashboard({ fields, user }: { fields: FieldWithUpdates[], user: { name?: string | null } }) {
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

  const currentHour = new Date().getHours();
  let greeting = "Good evening";
  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-heading font-semibold text-foreground">
          {greeting}, {user?.name?.split(' ')[0] || "Agent"}
        </h2>
        <p className="text-muted-foreground text-sm">{today}</p>
      </div>

      <div className="flex-1 min-h-0 pb-4">
        <div className="grid grid-cols-4 gap-4 h-full">
          {columns.map(col => (
            <div key={col.stage} className="min-w-0 flex flex-col bg-muted/30 rounded-xl border border-border">
              <div className="p-3 border-b border-border flex justify-between items-center bg-card rounded-t-xl">
                <h3 className="font-medium text-foreground">{col.title}</h3>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {col.data.length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {col.data.length > 0 ? (
                  col.data.map(field => (
                    <FieldCard key={field.id} field={field} />
                  ))
                ) : (
                  <div className="pt-4 text-center text-sm text-muted-foreground">
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
