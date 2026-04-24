import { Field, FieldUpdate } from "@prisma/client";
import { computeFieldStatus } from "@/lib/field-status";
import { FieldStage } from "@/types";
import { StatsCard } from "./StatsCard";
import { StageBreakdownChart } from "./StageBreakdownChart";
import { Map, AlertTriangle, CheckCircle, Wheat } from "lucide-react";
import { StatusBadge } from "../fields/StatusBadge";
import { StageBadge } from "../fields/StageBadge";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type FieldWithDetails = Field & { updates: FieldUpdate[], agent: { name: string } | null };

export function AdminDashboard({ fields }: { fields: FieldWithDetails[] }) {
  const statuses = fields.map(f => computeFieldStatus(f));
  const activeFields = statuses.filter(s => s === "active").length;
  const atRiskFields = statuses.filter(s => s === "at_risk").length;
  const harvestedFields = statuses.filter(s => s === "completed").length;

  // Compute stats for pie chart
  const stages = {
    [FieldStage.PLANTED]: 0,
    [FieldStage.GROWING]: 0,
    [FieldStage.READY]: 0,
    [FieldStage.HARVESTED]: 0,
  };
  
  fields.forEach(f => {
    stages[f.stage as FieldStage]++;
  });

  const chartData = [
    { name: "Planted", value: stages[FieldStage.PLANTED] },
    { name: "Growing", value: stages[FieldStage.GROWING] },
    { name: "Ready", value: stages[FieldStage.READY] },
    { name: "Harvested", value: stages[FieldStage.HARVESTED] },
  ].filter(d => d.value > 0);

  // Recent activity (flatten all updates, sort by desc, take 5)
  const recentUpdates = fields
    .flatMap(f => f.updates.map(u => ({ ...u, fieldName: f.name, agentName: f.agent?.name })))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-semibold text-foreground">Command Center</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Fields" value={fields.length} icon={<Map className="w-4 h-4" />} />
        <StatsCard title="Active Fields" value={activeFields} icon={<Wheat className="w-4 h-4" />} />
        <StatsCard title="At Risk Fields" value={atRiskFields} highlight={atRiskFields > 0 ? "amber" : "none"} icon={<AlertTriangle className="w-4 h-4" />} />
        <StatsCard title="Harvested Season" value={harvestedFields} icon={<CheckCircle className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-medium text-lg text-foreground">All Fields</h3>
            <Link href="/fields/new">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Field
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted hover:bg-muted border-b-border">
                  <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Crop</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Agent</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Stage</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.slice(0, 10).map((field) => (
                  <TableRow key={field.id} className="border-b-border hover:bg-primary/5 transition-colors cursor-pointer relative">
                    <TableCell className="font-medium text-foreground">
                      <Link href={`/fields/${field.id}`} className="absolute inset-0" aria-label="View field details"></Link>
                      {field.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{field.cropType}</TableCell>
                    <TableCell className="text-muted-foreground">{field.agent?.name || "Unassigned"}</TableCell>
                    <TableCell><StageBadge stage={field.stage as FieldStage} /></TableCell>
                    <TableCell><StatusBadge status={computeFieldStatus(field)} /></TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No fields available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {fields.length > 10 && (
            <div className="p-3 border-t border-border text-center bg-muted">
               <Link href="/fields" className="text-sm font-medium text-primary hover:underline">View All Fields</Link>
            </div>
          )}
        </div>

        <div className="space-y-6 lg:col-span-1 flex flex-col min-h-0 h-full">
          <StageBreakdownChart data={chartData} />
          
          <div className="bg-card border border-border rounded-xl shadow-sm p-4 flex-1">
            <h3 className="font-heading font-medium text-lg text-foreground border-b border-border pb-2 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {recentUpdates.length > 0 ? recentUpdates.map((update) => (
                <div key={update.id} className="flex gap-3 items-start border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {update.agentName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{update.agentName || "An Agent"}</span> updated <span className="font-medium">{update.fieldName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Changed to {update.stage}
                    </p>
                    {update.notes && <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">"{update.notes}"</p>}
                    <p className="text-[10px] text-muted-foreground mt-1 uppercase">
                      {new Date(update.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
