"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  date: string;
  Planted: number;
  Growing: number;
  Ready: number;
  Harvested: number;
}

export function ProgressLineChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="flex flex-col h-full border-[var(--color-border)] shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-heading text-foreground">Field Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {data.length === 0 ? (
          <div className="h-full min-h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            Not enough data.
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="Planted" stroke="#a7f3d0" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Growing" stroke="#10b981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Ready" stroke="#fbbf24" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Harvested" stroke="#064e3b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
