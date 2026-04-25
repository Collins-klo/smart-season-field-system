"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  agentName: string;
  Updates: number;
}

export function AgentPerformanceChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="flex flex-col h-full border-[var(--color-border)] shadow-sm bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-heading text-foreground">Agent Performance</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {data.length === 0 ? (
          <div className="h-full min-h-[250px] flex items-center justify-center text-muted-foreground text-sm">
            No agent data available.
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="agentName" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip
                  cursor={{ fill: 'var(--color-surface-muted)' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="Updates" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="var(--color-brand-primary)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
