import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  highlight?: "none" | "amber";
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, highlight = "none", icon }: StatsCardProps) {
  return (
    <Card className={cn(
      "border-[var(--color-border)] shadow-sm",
      highlight === "amber" && "bg-[var(--color-status-at-risk-bg)] border-[var(--color-status-at-risk)]"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
          {title}
        </CardTitle>
        {icon && <div className="text-[var(--color-brand-primary)] opacity-80">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold text-[var(--color-text-primary)] font-heading",
          highlight === "amber" && "text-[var(--color-status-at-risk)]"
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
