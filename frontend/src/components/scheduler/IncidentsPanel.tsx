import React from "react";
import type { Incident } from "../../services/scheduler";

type Props = {
  incidents: Incident[];
};

export default function IncidentsPanel({ incidents }: Props) {
  const [q, setQ] = React.useState("");
  const [sev, setSev] = React.useState<"all" | "low" | "medium" | "high">("all");

  const filtered = incidents.filter(i => {
    if (sev !== "all" && i.severity !== sev) return false;
    if (q && !(`Incident ${i.id}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  function verify(id: string) {
    // placeholder; wire to backend later
    alert(`Verified ${id}`);
  }

  function ignore(id: string) {
    alert(`Ignored ${id}`);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input className="border rounded-lg px-2 py-1.5 text-sm" placeholder="Search" value={q} onChange={e => setQ(e.target.value)} />
        <select className="border rounded-lg px-2 py-1.5 text-sm" value={sev} onChange={e => setSev(e.target.value as any)}>
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map(i => (
          <div key={i.id} className="border border-slate-200 rounded-lg p-2 flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">Incident {i.id}</div>
              <div className="text-slate-600">Severity: {i.severity}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 rounded bg-green-600 text-white text-sm" onClick={() => verify(i.id)}>Verify</button>
              <button className="px-2 py-1 rounded bg-slate-100 text-sm" onClick={() => ignore(i.id)}>Ignore</button>
            </div>
          </div>
        ))}
        {!filtered.length && (<div className="text-sm text-slate-500">No incidents.</div>)}
      </div>
    </div>
  );
}




