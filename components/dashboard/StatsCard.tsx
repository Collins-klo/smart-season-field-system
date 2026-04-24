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
      "border-border shadow-sm",
      highlight === "amber" && "bg-amber-500/10 border-amber-500"
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-primary opacity-80">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold text-foreground font-heading",
          highlight === "amber" && "text-amber-500"
        )}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
