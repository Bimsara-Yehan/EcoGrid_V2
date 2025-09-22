import React, { useMemo, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { defaultIcon } from "../lib/leafletFix";
import MapControls from "./MapControls";

export type Point = { id: string; coords: [number, number]; label: string; fill?: number };

// --- helper to pick cluster color by child markers' fill ---
function clusterClassFor(children: L.Layer[]) {
  let maxFill = 0;
  for (const layer of children) {
    const m = layer as L.Marker;
    const data = (m.options as any).data as Point | undefined;
    if (data?.fill != null) maxFill = Math.max(maxFill, data.fill);
  }
  if (maxFill >= 75) return "eg-cluster eg-cluster--danger";
  if (maxFill >= 50) return "eg-cluster eg-cluster--warn";
  return "eg-cluster eg-cluster--ok";
}

// --- Cluster layer that adds markers in chunks (lazy-ish) ---
function ClusterLayer({ points, selectedId }: { points: Point[]; selectedId?: string }) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // Create cluster group with custom icon
    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      iconCreateFunction: (cl) => {
        const count = cl.getChildCount();
        const cls = clusterClassFor(cl.getAllChildMarkers() as unknown as L.Layer[]);
        return L.divIcon({
          html: `<div class="${cls}">${count}</div>`,
          className: "eg-cluster-wrapper",
          iconSize: [36, 36]
        });
      },
      // disableClusteringAtZoom: 17,
      // maxClusterRadius: 60,
      // spiderfyOnEveryZoom: true,
    });
    clusterRef.current = cluster;

    // --- LAZY ADD: add markers in batches to keep UI smooth ---
    const batchSize = 500;
    let i = 0;

    function addNextBatch() {
      const batch: L.Marker[] = [];
      for (let j = 0; j < batchSize && i < points.length; j++, i++) {
        const p = points[i];
        const [lat, lng] = p.coords;
        const navUrl = `https://www.google.com/maps/dir/?api=1&origin=Current+Location&destination=${encodeURIComponent(
          `${lat},${lng}`
        )}&travelmode=driving`;

        const html = `
          <div style="font-weight:600">${p.label}</div>
          <div style="margin-top:6px">
            <a href="${navUrl}" target="_blank" rel="noopener" style="color:#1F8B24;font-weight:600">🧭 Navigate</a>
          </div>
          ${p.id === selectedId ? '<div style="margin-top:4px;font-size:12px">Selected</div>' : ""}
        `;

        const marker = L.marker(p.coords, {
          icon: defaultIcon,
          title: p.label,
          ...( { data: p } as any)
        }).bindPopup(html);

        batch.push(marker);
      }

      if (batch.length) cluster.addLayers(batch);
      if (i < points.length) {
        // schedule next chunk when browser is idle-ish
        (window as any).requestIdleCallback
          ? (window as any).requestIdleCallback(addNextBatch)
          : window.setTimeout(addNextBatch, 16);
      }
    }

    addNextBatch();
    map.addLayer(cluster);

    return () => {
      map.removeLayer(cluster);
      cluster.clearLayers();
      clusterRef.current = null;
    };
  }, [map, points, selectedId]);

  return null;
}

export default function MapView({ points, selectedId }: { points: Point[]; selectedId?: string }) {
  const center = useMemo<[number, number]>(() => points[0]?.coords ?? [7.2906, 80.6337], [points]);
  const allCoords = useMemo(() => points.map(p => p.coords), [points]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ height: "56vh", minHeight: 320, position: "relative" }}>
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ClusterLayer points={points} selectedId={selectedId} />
        {/* Controls overlay */}
        <MapControls allCoords={allCoords} />
      </MapContainer>
    </div>
  );
}
