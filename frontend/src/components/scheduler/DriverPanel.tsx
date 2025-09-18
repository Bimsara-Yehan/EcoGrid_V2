import React from "react";
import type { Driver, Depot } from "../../services/scheduler";
import type { Plan } from "./PlanningPanel";

type Props = {
  drivers: Driver[];
  depots: Depot[];
  value: Record<string, { depotId?: string; windowStart?: string; windowEnd?: string; maxStops?: number }>;
  onChange: (next: Props["value"]) => void;
  plan?: Plan;
  focusedDriverId?: string;
  onFocusDriver?: (driverId: string) => void;
};

export default function DriverPanel({ drivers, depots, value, onChange, plan, focusedDriverId, onFocusDriver }: Props) {
  const [depotFilter, setDepotFilter] = React.useState<string>("all");
  const depotById = React.useMemo(() => Object.fromEntries(depots.map(d => [d.id, d])), [depots]);

  function update(id: string, patch: Partial<{ depotId?: string; windowStart?: string; windowEnd?: string; maxStops?: number }>) {
    const prev = value[id] || {};
    onChange({ ...value, [id]: { ...prev, ...patch } });
  }

  // Group by resolved depot (selected override or default)
  const groups = React.useMemo(() => {
    const m = new Map<string, Driver[]>();
    for (const d of drivers) {
      const depId = value[d.id]?.depotId || d.defaultDepotId || "(none)";
      const list = m.get(depId) || [];
      list.push(d); m.set(depId, list);
    }
    return m;
  }, [drivers, value]);

  const orderedDepotIds = React.useMemo(() => {
    const ids = Array.from(groups.keys());
    // Move actual depots first, then (none)
    ids.sort((a,b) => (a === "(none)" ? 1 : 0) - (b === "(none)" ? 1 : 0));
    return ids;
  }, [groups]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select className="border rounded-lg px-2 py-1.5 text-sm" value={depotFilter} onChange={e => setDepotFilter(e.target.value)}>
          <option value="all">All depots</option>
          {depots.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
          <option value="(none)">(No depot)</option>
        </select>
      </div>

      {orderedDepotIds.map(depId => {
        if (depotFilter !== "all" && depotFilter !== depId) return null;
        const list = groups.get(depId)!;
        const depName = depId === "(none)" ? "No depot" : (depotById[depId]?.name || depId);
        return (
          <div key={depId} className="border border-slate-200 rounded-xl">
            <div className="px-3 py-2 text-sm font-semibold bg-slate-50 rounded-t-xl">{depName} <span className="text-slate-500 font-normal">· {list.length} driver(s)</span></div>
            <div className="p-3 space-y-3">
              {list.map(d => {
        const v = value[d.id] || {};
        const depot = v.depotId ?? d.defaultDepotId ?? "";
        const ws = v.windowStart ?? d.shiftWindow?.start ?? "08:30";
        const we = v.windowEnd ?? d.shiftWindow?.end ?? "14:00";
        const ms = v.maxStops ?? d.maxStops ?? 40;
        const assigned = plan?.[d.id]?.length ?? 0;
        const util = Math.min(100, Math.round((assigned / (ms || 1)) * 100));
        return (
          <div key={d.id} className={`border rounded-xl p-3 ${focusedDriverId === d.id ? "border-green-500" : "border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: d.color }} />
                <button className="font-medium hover:underline" onClick={() => onFocusDriver && onFocusDriver(d.id)} title="Focus this route on the map">{d.name}</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <label className="text-sm">
                <div className="text-slate-600 mb-1">Depot</div>
                <select className="w-full border rounded-lg px-2 py-1.5" value={depot}
                  onChange={e => update(d.id, { depotId: e.target.value })}>
                  <option value="">Select depot</option>
                  {depots.map(dp => (
                    <option key={dp.id} value={dp.id}>{dp.name}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">Max stops</div>
                <input type="number" className="w-full border rounded-lg px-2 py-1.5" value={ms}
                  onChange={e => update(d.id, { maxStops: Number(e.target.value) })} />
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">Window start</div>
                <input type="time" className="w-full border rounded-lg px-2 py-1.5" value={ws}
                  onChange={e => update(d.id, { windowStart: e.target.value })} />
              </label>

              <label className="text-sm">
                <div className="text-slate-600 mb-1">Window end</div>
                <input type="time" className="w-full border rounded-lg px-2 py-1.5" value={we}
                  onChange={e => update(d.id, { windowEnd: e.target.value })} />
              </label>
            </div>

            <div className="mt-2 text-xs text-slate-600">Utilization: {assigned}/{ms} stops
              <div className="w-full h-2 bg-slate-200 rounded-full mt-1">
                <div className="h-2 rounded-full" style={{ width: `${util}%`, background: d.color, opacity: 0.8 }} />
              </div>
            </div>
          </div>
        );
      })}
            </div>
          </div>
        );
      })}
      {!drivers.length && (
        <div className="text-sm text-slate-600">No drivers (mock data not loaded)</div>
      )}
    </div>
  );
}


