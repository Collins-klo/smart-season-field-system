import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computeFieldStatus } from "@/lib/field-status";
import { StatusBadge } from "@/components/fields/StatusBadge";
import { StageBadge } from "@/components/fields/StageBadge";
import { FieldStage, Role } from "@/types";
import { FieldUpdateTimeline } from "@/components/fields/FieldUpdateTimeline";
import { FieldUpdateForm } from "@/components/fields/FieldUpdateForm";
import { MapPin, Maximize, User } from "lucide-react";
import { format } from "date-fns";

export const unstable_instant = false;

export default async function FieldDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const resolvedParams = await params;
  const field = await prisma.field.findUnique({
    where: { id: resolvedParams.id },
    include: {
      agent: true,
      updates: {
        include: { agent: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!field) notFound();

  const role = (session.user as any).role;
  const isAgentAssigned = field.agentId === session.user.id;
  const isAdmin = role === Role.ADMIN;
  
  if (!isAdmin && !isAgentAssigned) {
    redirect("/dashboard");
  }

  const status = computeFieldStatus(field);

  // Read-only for agents not assigned? Handled by redirect above
  // Can agent update? Only if active or at_risk. We allow them to always update stage if needed, except maybe completed. Let's not block it strictly, but they might need to correct a mistake.
  const canUpdate = isAdmin || isAgentAssigned;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <h1 className="text-3xl font-heading font-medium text-[var(--color-text-primary)] mb-2 flex items-center gap-3">
            {field.name}
            <StatusBadge status={status} />
          </h1>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 opacity-70" /> {field.location || "Unknown location"}</span>
            <span className="flex items-center gap-1.5"><User className="w-4 h-4 opacity-70" /> {field.agent?.name || "Unassigned"}</span>
          </div>
        </div>
        
        {canUpdate && (
          <div className="shrink-0">
            <FieldUpdateForm fieldId={field.id} currentStage={field.stage} disabled={field.stage === FieldStage.HARVESTED} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="space-y-6">
          <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-surface)]">
            <CardHeader className="pb-3 border-b border-[var(--color-border)]">
              <CardTitle className="text-lg font-heading text-[var(--color-text-primary)]">Field Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider">Crop Type</p>
                  <p className="font-medium text-[var(--color-text-primary)]">{field.cropType}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider">Current Stage</p>
                  <div><StageBadge stage={field.stage as FieldStage} /></div>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider">Planted Date</p>
                  <p className="font-medium text-[var(--color-text-primary)]">{format(new Date(field.plantingDate), 'MMM d, yyyy')}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider">Size</p>
                  <p className="font-medium text-[var(--color-text-primary)] flex items-center gap-1">
                    <Maximize className="w-3.5 h-3.5 opacity-70" /> 
                    {field.sizeHectares ? `${field.sizeHectares} HA` : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-brand-xlight)]/30">
             <CardContent className="p-4">
                <p className="text-sm text-[var(--color-text-secondary)] italic">
                  "Status is computed from rule-based timing and agent updates. Keep the stage up to date."
                </p>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline */}
        <div className="md:col-span-2">
          <Card className="border-[var(--color-border)] shadow-sm bg-[var(--color-surface)] h-full">
            <CardHeader className="pb-3 border-b border-[var(--color-border)] flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-heading text-[var(--color-text-primary)]">Update History</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <FieldUpdateTimeline updates={field.updates} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
