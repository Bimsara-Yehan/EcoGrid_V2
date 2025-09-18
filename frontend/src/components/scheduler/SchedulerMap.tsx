import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { defaultIcon } from "../../lib/leafletFix";
import type { Depot, Facility, CustomerCandidate, BinCandidate, Incident, Driver } from "../../services/scheduler";
import type { Plan } from "./planningUtils";

type Props = {
  depots: Depot[];
  facilities: Facility[];
  customers: CustomerCandidate[];
  bins: BinCandidate[];
  incidents: Incident[];
  show: { customers: boolean; bins: boolean; incidents: boolean; facilities: boolean; depots: boolean; numbers: boolean };
  // planning overlays
  plan?: Plan;
  drivers?: Driver[];
  focusedDriverId?: string;
  driverDepotIdByDriverId?: Record<string, string | undefined>;
  hoveredStopId?: string;
  onMarkerClick?: (driverId: string, stopId?: string) => void;
  showFitControls?: boolean;
  // external control signals (increment to trigger)
  fitDriverSignal?: number;
  fitAllSignal?: number;
  clearSelectionSignal?: number;
};

function colorForService(kind: string): string {
  if (kind === "recycling") return "#1f8b24";
  if (kind === "composting") return "#6b8e23";
  if (kind === "incineration") return "#a855f7";
  return "#2563eb"; // general
}

function colorForIncident(sev: "low" | "medium" | "high"): string {
  if (sev === "high") return "#dc2626";
  if (sev === "medium") return "#f59e0b";
  return "#6b7280";
}

export default function SchedulerMap({ depots, facilities, customers, bins, incidents, show, plan, drivers, focusedDriverId, driverDepotIdByDriverId, hoveredStopId, onMarkerClick, showFitControls = true, fitDriverSignal, fitAllSignal, clearSelectionSignal }: Props) {
  const center = useMemo<[number, number]>(() => [7.2906, 80.6337], []);
  const [map, setMap] = useState<L.Map | null>(null);
  const [snappedByDriver, setSnappedByDriver] = useState<Record<string, [number, number][]>>({});

  // Fetch road-snapped polylines using OSRM demo (fallback to straight lines on failure)
  useEffect(() => {
    if (!plan || !drivers) return;
    let cancelled = false;

    async function fetchRoute(points: [number, number][]): Promise<[number, number][]> {
      // OSRM expects lon,lat in path; we have [lat, lng]
      const coords = points.map(p => `${p[1]},${p[0]}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
      try {
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const geometry = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined; // [lng,lat]
        if (!geometry) throw new Error("no geometry");
        return geometry.map(([lng, lat]) => [lat, lng]);
      } catch {
        return points; // fallback
      }
    }

    (async () => {
      const updates: Record<string, [number, number][]> = {};
      for (const d of drivers) {
        const stops = plan[d.id] || [];
        if (!stops.length) continue;
        const depotId = driverDepotIdByDriverId?.[d.id];
        const depot = depotId ? depots.find(x => x.id === depotId) : undefined;
        const path: [number, number][] = [];
        if (depot) path.push(depot.coords);
        stops.forEach(s => path.push(s.coords));
        if (path.length < 2) continue;

        // To avoid URL length issues, request per leg and concatenate
        const snapped: [number, number][][] = [];
        for (let i = 0; i < path.length - 1; i++) {
          const seg = await fetchRoute([path[i], path[i + 1]]);
          snapped.push(seg);
          if (cancelled) return;
        }
        const merged: [number, number][] = [];
        for (let i = 0; i < snapped.length; i++) {
          const seg = snapped[i];
          if (i === 0) merged.push(...seg);
          else merged.push(...seg.slice(1)); // avoid duplicate joint point
        }
        updates[d.id] = merged;
      }
      if (!cancelled) setSnappedByDriver(updates);
    })();

    return () => { cancelled = true; };
  }, [plan, drivers, depots, driverDepotIdByDriverId]);

  // simple z-index layering via pane order
  useEffect(() => {
    const panes = [
      ["pane-depots", 410],
      ["pane-facilities", 400],
      ["pane-customers", 300],
      ["pane-bins", 310],
      ["pane-incidents", 320],
    ] as const;
    panes.forEach(([name, z]) => {
      const mapPane = (document.querySelector(`.leaflet-pane.${name}`) as HTMLDivElement) || undefined;
      if (mapPane) mapPane.style.zIndex = String(z);
    });
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden relative" style={{ height: 480, minHeight: 360 }}>
      {showFitControls && (
        <div className="absolute z-[1000] right-3 top-3 flex gap-2">
          <button
            className="px-2.5 py-1.5 text-sm rounded-lg bg-white border border-slate-300 shadow"
            onClick={() => {
              onMarkerClick && onMarkerClick("", undefined);
            }}
            title="Clear selection"
          >
            Clear
          </button>
          <button
            className="px-2.5 py-1.5 text-sm rounded-lg bg-white border border-slate-300 shadow"
            onClick={() => {
              if (!map || !plan || !drivers) return;
              const drvId = focusedDriverId;
              if (!drvId) return;
              const stops = plan[drvId] || [];
              const depotId = driverDepotIdByDriverId?.[drvId];
              const depot = depotId ? depots.find(d => d.id === depotId) : undefined;
              const points: [number, number][] = [];
              if (depot) points.push(depot.coords);
              stops.forEach(s => points.push(s.coords));
              if (points.length) map.fitBounds(L.latLngBounds(points as any), { padding: [24, 24] });
            }}
            title="Fit to current driver route"
          >
            Fit driver
          </button>
          <button
            className="px-2.5 py-1.5 text-sm rounded-lg bg-white border border-slate-300 shadow"
            onClick={() => {
              if (!map || !plan || !drivers) return;
              const all: [number, number][][] = [];
              Object.keys(plan).forEach(id => {
                const stops = plan[id] || [];
                const depotId = driverDepotIdByDriverId?.[id];
                const depot = depotId ? depots.find(d => d.id === depotId) : undefined;
                const points: [number, number][] = [];
                if (depot) points.push(depot.coords);
                stops.forEach(s => points.push(s.coords));
                if (points.length) all.push(points);
              });
              const flat = all.flat();
              if (flat.length) map.fitBounds(L.latLngBounds(flat as any), { padding: [24, 24] });
            }}
            title="Fit to all routes"
          >
            Fit all
          </button>
        </div>
      )}
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} whenCreated={setMap}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

        {show.depots && (
          <div className="leaflet-pane pane-depots">
            {depots.map(d => (
              <Marker key={d.id} position={d.coords} icon={defaultIcon}>
                <Popup>
                  <div className="font-semibold">{d.name}</div>
                  <div className="text-xs text-slate-600">Depot</div>
                </Popup>
              </Marker>
            ))}
          </div>
        )}

        {show.facilities && (
          <div className="leaflet-pane pane-facilities">
            {facilities.map(f => (
              <Marker key={f.id} position={f.coords} icon={defaultIcon}>
                <Popup>
                  <div className="font-semibold">{f.name}</div>
                  <div className="text-xs text-slate-600">{f.type}</div>
                </Popup>
              </Marker>
            ))}
          </div>
        )}

        {show.customers && (
          <div className="leaflet-pane pane-customers">
            {customers.map((c, idx) => (
              <CircleMarker key={c.id} center={c.coords} radius={6} pathOptions={{ color: colorForService(c.serviceKind), fillOpacity: 0.9 }}>
                <Popup>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-slate-600">{c.serviceKind}</div>
                </Popup>
              </CircleMarker>
            ))}
          </div>
        )}

        {show.bins && (
          <div className="leaflet-pane pane-bins">
            {bins.map(b => (
              <CircleMarker key={b.id} center={b.coords} radius={7} pathOptions={{ color: b.fillLevel >= 75 ? "#dc2626" : b.fillLevel >= 50 ? "#f59e0b" : "#16a34a", fillOpacity: 0.9 }}>
                <Popup>
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-slate-600">Fill: {b.fillLevel}%</div>
                </Popup>
              </CircleMarker>
            ))}
          </div>
        )}

        {show.incidents && (
          <div className="leaflet-pane pane-incidents">
            {incidents.map(i => (
              <CircleMarker key={i.id} center={i.coords} radius={8} pathOptions={{ color: colorForIncident(i.severity), fillOpacity: 0.8 }}>
                <Popup>
                  <div className="font-semibold">Incident</div>
                  <div className="text-xs text-slate-600">Severity: {i.severity}</div>
                </Popup>
              </CircleMarker>
            ))}
          </div>
        )}

        {/* Planned routes overlays */}
        {plan && drivers && Object.keys(plan).map(drvId => {
          const stops = plan[drvId] || [];
          if (!stops.length) return null;
          const color = drivers.find(d => d.id === drvId)?.color || "#0ea5e9";
          const depotId = driverDepotIdByDriverId?.[drvId];
          const depot = depotId ? depots.find(d => d.id === depotId) : undefined;
          const path: [number, number][] = [];
          if (depot) path.push(depot.coords);
          stops.forEach(s => path.push(s.coords));
          const isFocused = focusedDriverId ? focusedDriverId === drvId : true;
          return (
            <div key={`route-${drvId}`}>
              <Polyline positions={snappedByDriver[drvId] ?? path} pathOptions={{ color, weight: isFocused ? 5 : 3, opacity: isFocused ? 0.9 : 0.5 }} />
              {show.numbers && focusedDriverId === drvId && stops.map((s, idx) => (
                <Marker
                  key={`seq-${drvId}-${s.id}`}
                  position={s.coords}
                  icon={L.divIcon({
                    html: `<div style="background:${color};color:#fff;border-radius:9999px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px">${idx + 1}</div>`,
                    className: "",
                    iconSize: [22, 22]
                  })}
                  eventHandlers={{ click: () => onMarkerClick && onMarkerClick(drvId, s.id) }}
                />
              ))}
              {hoveredStopId && stops.some(s => s.id === hoveredStopId) && (
                <CircleMarker center={(stops.find(s => s.id === hoveredStopId)!).coords} radius={12} pathOptions={{ color, opacity: 0.8 }} />
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

// React to external control signals
// Fit to current driver
export function useFitDriver(map: L.Map | null, signal: number | undefined, plan: Plan | undefined, drivers: Driver[] | undefined, focusedDriverId: string | undefined, depots: Depot[], driverDepotIdByDriverId?: Record<string, string | undefined>) {
  useEffect(() => {
    if (!map || !signal || !plan || !drivers || !focusedDriverId) return;
    const stops = plan[focusedDriverId] || [];
    const depotId = driverDepotIdByDriverId?.[focusedDriverId];
    const depot = depotId ? depots.find(d => d.id === depotId) : undefined;
    const points: [number, number][] = [];
    if (depot) points.push(depot.coords);
    stops.forEach(s => points.push(s.coords));
    if (points.length) map.fitBounds(L.latLngBounds(points as any), { padding: [24, 24] });
  }, [signal]);
}

export function useFitAll(map: L.Map | null, signal: number | undefined, plan: Plan | undefined, drivers: Driver[] | undefined, depots: Depot[], driverDepotIdByDriverId?: Record<string, string | undefined>) {
  useEffect(() => {
    if (!map || !signal || !plan || !drivers) return;
    const all: [number, number][][] = [];
    Object.keys(plan).forEach(id => {
      const stops = plan[id] || [];
      const depotId = driverDepotIdByDriverId?.[id];
      const depot = depotId ? depots.find(d => d.id === depotId) : undefined;
      const points: [number, number][] = [];
      if (depot) points.push(depot.coords);
      stops.forEach(s => points.push(s.coords));
      if (points.length) all.push(points);
    });
    const flat = all.flat();
    if (flat.length) map.fitBounds(L.latLngBounds(flat as any), { padding: [24, 24] });
  }, [signal]);
}

export function useClearSelection(signal: number | undefined, onMarkerClick?: (driverId: string, stopId?: string) => void) {
  useEffect(() => {
    if (!signal) return;
    onMarkerClick && onMarkerClick("", undefined);
  }, [signal]);
}


