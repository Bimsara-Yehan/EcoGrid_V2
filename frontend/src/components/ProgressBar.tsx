import React from "react";

export default function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden" aria-label={`Route progress ${pct}%`}>
      <div className="h-full" style={{ width: `${pct}%`, backgroundColor: 'var(--primary)' }} />
    </div>
  );
}
