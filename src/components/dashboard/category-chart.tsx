"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS: Record<string, string> = {
  iac: "#22d3ee",
  sast: "#a78bfa",
  dast: "#f472b6",
  sca: "#fbbf24",
  secrets: "#fb7185",
  container: "#34d399",
};

export function CategoryDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = data.filter((d) => d.value > 0);

  if (!mounted) {
    return <div className="h-64 w-full animate-pulse rounded-lg bg-white/5" aria-hidden />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={88}
            paddingAngle={3}
            stroke="none"
          >
            {filtered.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#64748b"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
