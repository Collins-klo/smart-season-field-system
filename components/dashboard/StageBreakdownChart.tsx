"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StageData {
  name: string;
  value: number;
}

interface StageBreakdownChartProps {
  data: StageData[];
}

// Ensure the colors map to our design system
const COLORS = [
  "var(--color-brand-xlight)",
  "var(--color-brand-light)",
  "var(--color-brand-secondary)",
  "var(--color-brand-primary)",
];

export function StageBreakdownChart({ data }: StageBreakdownChartProps) {
  return (
    <Card className="flex flex-col h-full border-[var(--color-border)] shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-heading text-[var(--color-text-primary)]">Stage Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[var(--color-text-muted)] text-sm">
            No fields available.
          </div>
        ) : (
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
