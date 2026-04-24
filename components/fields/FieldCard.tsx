import { Field, FieldUpdate } from "@prisma/client";
import { computeFieldStatus } from "@/lib/field-status";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, Sprout } from "lucide-react";

export function FieldCard({ field }: { field: Field & { updates: FieldUpdate[] } }) {
  const status = computeFieldStatus(field);
  
  const sortedUpdates = [...field.updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  const lastUpdate = sortedUpdates[0];
  let daysSinceUpdateText = "No updates yet";
  
  if (lastUpdate) {
    const daysSince = Math.floor((new Date().getTime() - new Date(lastUpdate.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    daysSinceUpdateText = daysSince === 0 ? "Updated today" : `Updated ${daysSince} day${daysSince > 1 ? 's' : ''} ago`;
  }

  return (
    <Card className="border-border shadow-sm bg-card hover:border-primary/50 transition-colors">
      <CardContent className="p-4 grid gap-3">
        <div className="flex justify-between items-start">
          <Link href={`/fields/${field.id}`} className="hover:underline hover:text-primary">
            <h4 className="font-heading font-medium text-foreground text-lg leading-tight">{field.name}</h4>
          </Link>
          <StatusBadge status={status} />
        </div>
        
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 opacity-70" />
            <span>{field.cropType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            <span className={status === 'at_risk' ? 'text-amber-500 font-medium' : ''}>
              {daysSinceUpdateText}
            </span>
          </div>
        </div>

        <Link href={`/fields/${field.id}`} className="mt-1">
          <Button variant="outline" size="sm" className="w-full text-xs h-8 border-primary/20 text-primary hover:bg-primary/10">
            View & Log Update
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
