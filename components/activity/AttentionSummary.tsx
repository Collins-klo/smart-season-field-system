import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock } from "lucide-react";

interface AttentionSummaryProps {
  atRiskCount: number;
  staleCount: number;
}

export function AttentionSummary({ atRiskCount, staleCount }: AttentionSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card className="border-red-500/30 bg-red-500/5 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-red-500">Fields At Risk</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{atRiskCount}</div>
          <p className="text-xs text-red-600/70 mt-1">Requires immediate attention</p>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30 bg-amber-500/5 shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium text-amber-500">Stale Fields</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{staleCount}</div>
          <p className="text-xs text-amber-600/70 mt-1">Not updated in 7+ days</p>
        </CardContent>
      </Card>
    </div>
  );
}
