import React from "react";
import type { CustomerCandidate, Driver, Depot } from "../../services/scheduler";
import { suggestPlan } from "./planningUtils";

type PlannedStop = { id: string; name: string; coords: [number, number] };
export type Plan = Record<string, PlannedStop[]>; // driverId -> ordered stops

type Props = {
  drivers: Driver[];
  depots: Depot[];
  customers: CustomerCandidate[];
  driverConfig: Record<string, { depotId?: string; windowStart?: string; windowEnd?: string; maxStops?: number }>;
  value: Plan;
  onChange: (next: Plan) => void;
  // map/list sync callbacks
  focusedDriverId?: string;
  onFocusDriver?: (driverId: string) => void;
  onHoverStop?: (driverId: string, stopId: string) => void;
  onLeaveStop?: () => void;
  onClickStop?: (driverId: string, stopId: string, coords: [number, number]) => void;
  serviceDate?: string;
};

function toRad(d: number) { return (d * Math.PI) / 180; }
function haversineKm(a: [number, number], b: [number, number]) {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function nearestNeighborOrder(start: [number, number], points: PlannedStop[]): PlannedStop[] {
  const remaining = [...points];
  const ordered: PlannedStop[] = [];
  let current = start;
  while (remaining.length) {
    let best = 0; let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i].coords);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    const next = remaining.splice(best, 1)[0];
    ordered.push(next);
    current = next.coords;
  }
  return ordered;
}

export default function PlanningPanel({ drivers, depots, customers, driverConfig, value, onChange, focusedDriverId, onFocusDriver, onHoverStop, onLeaveStop, onClickStop, serviceDate }: Props) {
  const exportDriverCsv = React.useMemo(() => exportDriverCsvFactory(value, depots, driverConfig), [value, depots, driverConfig]);
  const printDriver = React.useMemo(() => printDriverFactory(value, depots, driverConfig, drivers, serviceDate), [value, depots, driverConfig, drivers, serviceDate]);
  function runHeuristic() {
    const depotById = Object.fromEntries(depots.map(d => [d.id, d]));
    const nextPlan = suggestPlan(drivers, depots, driverConfig, customers, depotById);
    onChange(nextPlan);
  }

  function move(drvId: string, idx: number, dir: -1 | 1) {
    const current = value[drvId] ?? [];
    const j = idx + dir;
    if (j < 0 || j >= current.length) return;
    const next = [...current];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange({ ...value, [drvId]: next });
  }

  function clearPlan() {
    onChange({});
  }

  const avgSpeedKmh = 25; // rough city driving
  function metricsFor(drvId: string) {
    const depId = driverConfig[drvId]?.depotId || drivers.find(d => d.id === drvId)?.defaultDepotId;
    const dep = depId ? depots.find(d => d.id === depId) : undefined;
    const stops = value[drvId] ?? [];
    let distance = 0;
    let prev = dep?.coords;
    for (const s of stops) {
      if (prev) distance += haversineKm(prev, s.coords);
      prev = s.coords;
    }
    const travelHours = distance / avgSpeedKmh;
    const serviceMinutes = stops.length * 3;
    const minutes = Math.round(travelHours * 60 + serviceMinutes);
    return { stops: stops.length, distanceKm: distance.toFixed(1), durationMin: minutes };
  }

  function warningsFor(drvId: string) {
    const m = metricsFor(drvId);
    const maxStops = driverConfig[drvId]?.maxStops ?? drivers.find(d => d.id === drvId)?.maxStops ?? 40;
    const winStart = driverConfig[drvId]?.windowStart ?? drivers.find(d => d.id === drvId)?.shiftWindow?.start ?? "08:30";
    const winEnd = driverConfig[drvId]?.windowEnd ?? drivers.find(d => d.id === drvId)?.shiftWindow?.end ?? "14:00";
    // rough: minutes available between start/end
    const [sh, sm] = winStart.split(":").map(Number);
    const [eh, em] = winEnd.split(":").map(Number);
    const availableMin = (eh * 60 + em) - (sh * 60 + sm);
    const warns: string[] = [];
    if ((value[drvId]?.length || 0) > maxStops) warns.push(`Exceeds max stops (${maxStops})`);
    if (m.durationMin > availableMin) warns.push(`Exceeds time window (${availableMin} min)`);
    return { warns, availableMin };
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={runHeuristic} className="px-3 py-2 rounded-lg bg-green-600 text-white font-semibold" title="Automatically assigns customers to the nearest driver depot and orders stops to reduce travel. You can edit results.">Suggest routes</button>
        <button onClick={clearPlan} className="px-3 py-2 rounded-lg bg-slate-100">Clear plan</button>
      </div>

      {drivers.map(d => (
        <div key={d.id} className={`border rounded-xl p-3 ${focusedDriverId === d.id ? "border-green-500" : "border-slate-200"}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-3.5 rounded-full" style={{ background: d.color }} />
              <button className="font-medium hover:underline" onClick={() => onFocusDriver && onFocusDriver(d.id)} title="Focus this route on the map">{d.name}</button>
            </div>
            <div className="flex items-center gap-2">
              {(() => { const m = metricsFor(d.id); return (
                <div className="text-sm text-slate-600">{m.stops} stops · {m.distanceKm} km · {m.durationMin} min</div>
              ); })()}
              <button
                className="px-2 py-1 rounded bg-white border border-slate-300 text-xs"
                onClick={() => exportDriverCsv(d.id)}
                title="Download CSV for this driver's route"
              >CSV</button>
              <button
                className="px-2 py-1 rounded bg-white border border-slate-300 text-xs"
                onClick={() => printDriver(d.id)}
                title="Open print-friendly route page"
              >Print</button>
            </div>
          </div>

          <div className="grid gap-1">
            {(value[d.id] ?? []).map((s, idx) => (
              <div
                key={s.id}
                className="flex items-center justify-between border rounded-lg px-2 py-1.5"
                onMouseEnter={() => onHoverStop && onHoverStop(d.id, s.id)}
                onMouseLeave={() => onLeaveStop && onLeaveStop()}
                onClick={() => onClickStop && onClickStop(d.id, s.id, s.coords)}
                title="Click to center on map"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-6">{idx + 1}</span>
                  <span className="font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded bg-slate-100" onClick={() => move(d.id, idx, -1)} aria-label="Move up">↑</button>
                  <button className="px-2 py-1 rounded bg-slate-100" onClick={() => move(d.id, idx, +1)} aria-label="Move down">↓</button>
                </div>
              </div>
            ))}
            {!(value[d.id]?.length) && (
              <div className="text-sm text-slate-500">No stops assigned.</div>
            )}
            {/* Warnings */}
            {(() => { const w = warningsFor(d.id); return w.warns.length ? (
              <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">{w.warns.join(" · ")}</div>
            ) : null; })()}
          </div>
        </div>
      ))}
    </div>
  );
}

function downloadBlobCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportDriverCsvFactory(value: Plan, depots: Depot[], driverConfig: Record<string, { depotId?: string }>) {
  const depotById = Object.fromEntries(depots.map(d => [d.id, d]));
  return (driverId: string) => {
    const stops = value[driverId] ?? [];
    const depId = driverConfig[driverId]?.depotId;
    const depot = depId ? depotById[depId] : undefined;
    const rows: string[][] = [];
    rows.push(["seq", "label", "lat", "lng", "maps_url"]);
    if (depot) {
      const [lat, lng] = depot.coords;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lng)}`;
      rows.push(["0", depot.name || "Depot", String(lat), String(lng), url]);
    }
    stops.forEach((s, idx) => {
      const [lat, lng] = s.coords;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lat + "," + lng)}`;
      rows.push([String(idx + 1), s.name, String(lat), String(lng), url]);
    });
    const csv = rows.map(r => r.map(cell => /[",\n]/.test(cell) ? '"' + cell.replace(/"/g, '""') + '"' : cell).join(",")).join("\n");
    const date = new Date().toISOString().slice(0,10);
    downloadBlobCsv(`route_${driverId}_${date}.csv`, csv);
  };
}

// attach export function to component scope
function exportDriverCsv(this: any, driverId: string) {
  // 'this' will not be used; we wrap below during render
}

function printDriverFactory(value: Plan, depots: Depot[], driverConfig: Record<string, { depotId?: string }>, drivers: Driver[], serviceDate?: string) {
  const depotById = Object.fromEntries(depots.map(d => [d.id, d]));
  return (driverId: string) => {
    const driver = drivers.find(d => d.id === driverId);
    const stops = value[driverId] ?? [];
    const depId = driverConfig[driverId]?.depotId;
    const depot = depId ? depotById[depId] : undefined;
    const date = serviceDate || new Date().toISOString().slice(0,10);

    const win = window.open("", "_blank");
    if (!win) return;
    const rows = stops.map((s, idx) => `<tr><td>${idx + 1}</td><td>${s.name}</td><td>${s.coords[0].toFixed(5)}, ${s.coords[1].toFixed(5)}</td></tr>`).join("\n");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Route ${driver?.name || driverId}</title>
      <style>
        body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;padding:24px;color:#111}
        h1{font-size:20px;margin:0 0 8px}
        .muted{color:#475569;font-size:12px;margin-bottom:12px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #e2e8f0;padding:8px;text-align:left;font-size:13px}
        th{background:#f8fafc}
        @media print{button{display:none}}
      </style>
    </head><body>
      <button onclick="window.print()" style="padding:8px 12px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;float:right">Print</button>
      <h1>Driver ${driver?.name || driverId}</h1>
      <div class="muted">Date: ${date}${depot ? ` · Depot: ${depot.name}` : ''}</div>
      <table><thead><tr><th>#</th><th>Stop</th><th>Coords</th></tr></thead><tbody>${rows}</tbody></table>
    </body></html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };
}


