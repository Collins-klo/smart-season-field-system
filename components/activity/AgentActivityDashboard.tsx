import { Field, FieldUpdate } from "@prisma/client";
import { SmartInsights } from "./SmartInsights";
import { StatusPieChart } from "./charts/StatusPieChart";
import { ActivityTimelineChart } from "./charts/ActivityTimelineChart";
import { AttentionSummary } from "./AttentionSummary";
import { computeFieldStatus } from "@/lib/field-status";

type FieldWithDetails = Field & { updates: FieldUpdate[]; agent: { name: string } | null };

export function AgentActivityDashboard({ fields, userId }: { fields: FieldWithDetails[], userId: string }) {
  const now = new Date();

  // 1. Status Pie
  let active = 0, atRisk = 0, completed = 0;
  let staleCount = 0;

  fields.forEach(f => {
    const status = computeFieldStatus(f);
    if (status === "active") active++;
    else if (status === "at_risk") atRisk++;
    else if (status === "completed") completed++;

    // Calc Stale
    if (f.stage !== "HARVESTED") {
      const sorted = [...f.updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const lastDate = sorted[0] ? new Date(sorted[0].createdAt) : new Date(f.plantingDate);
      const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays > 7) staleCount++;
    }
  });

  const pieData = [
    { name: "Active", value: active, fill: "var(--color-status-active)" },
    { name: "At Risk", value: atRisk, fill: "var(--color-status-at-risk)" },
    { name: "Completed", value: completed, fill: "var(--color-status-completed)" }
  ].filter(d => d.value > 0);

  // 2. Activity Timeline (Last 7 Days)
  // Find all updates by this user.
  const myUpdates = fields.flatMap(f => f.updates).filter(u => u.agentId === userId);
  const timelineData = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Count updates matching this date
    const updatesThatDay = myUpdates.filter(u => {
      const ud = new Date(u.createdAt);
      return ud.getDate() === d.getDate() && ud.getMonth() === d.getMonth() && ud.getFullYear() === d.getFullYear();
    }).length;

    timelineData.push({
      date: dateStr,
      Updates: updatesThatDay
    });
  }

  return (
    <div className="space-y-6">
      <SmartInsights fields={fields} role="FIELD_AGENT" />

      <AttentionSummary atRiskCount={atRisk} staleCount={staleCount} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <StatusPieChart data={pieData} />
        <ActivityTimelineChart data={timelineData} />
      </div>
    </div>
  );
}
