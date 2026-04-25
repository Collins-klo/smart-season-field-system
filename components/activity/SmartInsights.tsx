import { Field, FieldUpdate } from "@prisma/client";
import { computeFieldStatus } from "@/lib/field-status";
import { Lightbulb, AlertTriangle, Users, Clock } from "lucide-react";

type FieldWithDetails = Field & { updates: FieldUpdate[]; agent: { name: string } | null };

export function SmartInsights({ fields, role }: { fields: FieldWithDetails[], role: "ADMIN" | "FIELD_AGENT" }) {
  const insights = [];
  const now = new Date();

  // 1. Stale Fields Insight
  let staleCount = 0;
  fields.forEach(field => {
    const sortedUpdates = [...field.updates].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const lastUpdate = sortedUpdates[0];
    const baseDate = lastUpdate ? new Date(lastUpdate.createdAt) : new Date(field.plantingDate);
    const daysSince = Math.floor((now.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Only count if not harvested
    if (field.stage !== "HARVESTED" && daysSince > 7) {
      staleCount++;
    }
  });

  if (staleCount > 0) {
    insights.push({
      icon: <Clock className="w-5 h-5 text-amber-500" />,
      text: `${staleCount} field${staleCount > 1 ? "s" : ""} ${staleCount > 1 ? "have" : "has"} not been updated in over 7 days.`,
      color: "border-amber-500/30 bg-amber-500/10 text-amber-100"
    });
  }

  // 2. Risk Demographics Insight
  const atRiskFields = fields.filter(f => computeFieldStatus(f) === "at_risk");
  if (atRiskFields.length > 0) {
    const cropCounts: Record<string, number> = {};
    atRiskFields.forEach(f => {
      cropCounts[f.cropType] = (cropCounts[f.cropType] || 0) + 1;
    });
    
    const mostRiskCrop = Object.keys(cropCounts).reduce((a, b) => cropCounts[a] > cropCounts[b] ? a : b);
    
    insights.push({
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      text: `Most at-risk fields are of crop type: ${mostRiskCrop} (${cropCounts[mostRiskCrop]} fields).`,
      color: "border-red-500/30 bg-red-500/10 text-red-100"
    });
  }

  // 3. Agent Contributions Insight (Admin Only)
  if (role === "ADMIN") {
    const allUpdates = fields.flatMap(f => f.updates);
    const totalUpdates = allUpdates.length;

    if (totalUpdates > 0) {
      const agentCounts: Record<string, number> = {};
      allUpdates.forEach(u => {
        agentCounts[u.agentId] = (agentCounts[u.agentId] || 0) + 1;
      });

      // Sort agents by contributions
      const sortedAgents = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]);
      
      let topAgentsCount = 0;
      let topAgentsUpdates = 0;
      
      for (const [_, count] of sortedAgents) {
        topAgentsCount++;
        topAgentsUpdates += count;
        if (topAgentsUpdates >= totalUpdates * 0.7) {
          break;
        }
      }

      if (topAgentsCount > 0 && topAgentsCount < sortedAgents.length && totalUpdates > 5) {
        insights.push({
          icon: <Users className="w-5 h-5 text-emerald-500" />,
          text: `${topAgentsCount} agent${topAgentsCount > 1 ? "s" : ""} contributed to 70%+ of all recent updates.`,
          color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
        });
      }
    }
  }

  // 4. Growing Stage warning
  const growingStaleCount = fields.filter(f => {
    if (f.stage !== "GROWING") return false;
    const sortedUpdates = [...f.updates].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    // Find when it entered GROWING
    const growingUpdate = sortedUpdates.find(u => u.stage === "GROWING");
    if (!growingUpdate) return false;
    // Assuming 60 days for growing, if more than 50 days passed and still growing...
    const daysInGrowing = Math.floor((now.getTime() - new Date(growingUpdate.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return daysInGrowing > 50;
  }).length;

  if (growingStaleCount > 0) {
    insights.push({
      icon: <Lightbulb className="w-5 h-5 text-blue-500" />,
      text: `${growingStaleCount} field${growingStaleCount > 1 ? "s" : ""} in 'Growing' stage ${growingStaleCount > 1 ? "are" : "is"} taking longer than expected.`,
      color: "border-blue-500/30 bg-blue-500/10 text-blue-100"
    });
  }

  // Fallback if no specific insights match
  if (insights.length === 0) {
    insights.push({
      icon: <Lightbulb className="w-5 h-5 text-primary" />,
      text: "Operations are running smoothly. All fields are updating within expected parameters.",
      color: "border-primary/30 bg-primary/10 text-primary"
    });
  }

  // Slice to max 3 items for UI cleaniness
  const displayInsights = insights.slice(0, 3);

  return (
    <div className="bg-card border border-border shadow-sm rounded-xl p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-heading font-medium text-lg text-foreground">Smart Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayInsights.map((insight, idx) => (
          <div key={idx} className={`p-4 rounded-lg border flex items-start gap-3 backdrop-blur-sm ${insight.color}`}>
            <div className="shrink-0 mt-0.5">
              {insight.icon}
            </div>
            <p className="text-sm font-medium">
              {insight.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
