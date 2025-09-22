import React from "react";

export default function StatCard(
  { label, value, hint }: { label: string; value: string | number; hint?: string }
) {
  return (
    <article className="bg-white rounded-2xl shadow-sm p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
    </article>
  );
}
