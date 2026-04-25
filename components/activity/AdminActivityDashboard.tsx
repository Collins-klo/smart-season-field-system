import { Field, FieldUpdate } from "@prisma/client";
import { SmartInsights } from "./SmartInsights";
import { StatusPieChart } from "./charts/StatusPieChart";
import { ProgressLineChart } from "./charts/ProgressLineChart";
import { AgentPerformanceChart } from "./charts/AgentPerformanceChart";
import { FreshnessChart } from "./charts/FreshnessChart";
import { computeFieldStatus } from "@/lib/field-status";

type FieldWithDetails = Field & { updates: FieldUpdate[]; agent: { name: string } | null };

export function AdminActivityDashboard({ fields }: { fields: FieldWithDetails[] }) {
  // 1. Status Pie
  let active = 0, atRisk = 0, completed = 0;
  fields.forEach(f => {
    const status = computeFieldStatus(f);
    if (status === "active") active++;
    else if (status === "at_risk") atRisk++;
    else if (status === "completed") completed++;
  });
  const pieData = [
    { name: "Active", value: active, fill: "var(--color-status-active)" },
    { name: "At Risk", value: atRisk, fill: "var(--color-status-at-risk)" },
    { name: "Completed", value: completed, fill: "var(--color-status-completed)" }
  ].filter(d => d.value > 0);

  // 2. Freshness Buckets
  const now = new Date();
  let b1 = 0, b2 = 0, b3 = 0; // <2, 3-7, 8+
  fields.forEach(f => {
    if (f.stage === "HARVESTED") return; // Skip completed for freshness usually
    const sorted = [...f.updates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastDate = sorted[0] ? new Date(sorted[0].createdAt) : new Date(f.plantingDate);
    const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 3) b1++;
    else if (diffDays <= 7) b2++;
    else b3++;
  });
  const freshnessData = [
    { bucket: "< 2 days", Fields: b1 },
    { bucket: "3 - 7 days", Fields: b2 },
    { bucket: "8+ days", Fields: b3 },
  ];

  // 3. Agent Performance
  const agentMap: Record<string, { updates: number, name: string }> = {};
  fields.forEach(f => {
    f.updates.forEach(u => {
      const aName = f.agent?.name || "Unassigned";
      if (!agentMap[u.agentId]) {
        agentMap[u.agentId] = { updates: 0, name: aName };
      }
      agentMap[u.agentId].updates++;
    });
  });
  const agentData = Object.values(agentMap)
    .sort((a, b) => b.updates - a.updates)
    .slice(0, 10)
    .map(a => ({ agentName: a.name, Updates: a.updates }));

  // 4. Progress Line Chart (Last 10 Days Snapshot)
  const progressData = [];
  for (let i = 9; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    let planted = 0, growing = 0, ready = 0, harvested = 0;
    
    fields.forEach(f => {
      const creationDate = new Date(f.createdAt);
      if (creationDate > d) return; // Field didn't exist yet
      
      // find the latest update before or on date `d`
      const pastUpdates = f.updates.filter(u => new Date(u.createdAt) <= d);
      // sort desc
      pastUpdates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      const stage = pastUpdates.length > 0 ? pastUpdates[0].stage : "PLANTED"; // Default is PLANTED if no updates yet
      
      if (stage === "PLANTED") planted++;
      else if (stage === "GROWING") growing++;
      else if (stage === "READY") ready++;
      else if (stage === "HARVESTED") harvested++;
    });

    progressData.push({
      date: dateStr,
      Planted: planted,
      Growing: growing,
      Ready: ready,
      Harvested: harvested
    });
  }

  return (
    <div className="space-y-6">
      <SmartInsights fields={fields} role="ADMIN" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart data={pieData} />
        <ProgressLineChart data={progressData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentPerformanceChart data={agentData} />
        <FreshnessChart data={freshnessData} />
      </div>
    </div>
  );
}
