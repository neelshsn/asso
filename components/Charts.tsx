"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export function MiniTrend({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A7D477" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#A7D477" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" hide />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#A7D477"
            fillOpacity={1}
            fill="url(#trend)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
