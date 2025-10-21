"use client";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function Sparkline({ data }: { data: { x: number; y: number }[] }) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <Area type="monotone" dataKey="y" stroke="#0ea5e9" fill="#0ea5e933" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
