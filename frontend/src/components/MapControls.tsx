import React, { useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function MapControls({ allCoords }: { allCoords: [number, number][] }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);

  function fitAll() {
    if (!allCoords.length) return;
    const bounds = L.latLngBounds(allCoords.map(([lat, lng]) => L.latLng(lat, lng)));
    map.fitBounds(bounds, { padding: [24, 24] });
  }

  async function locateMe() {
    if (!navigator.geolocation) return alert("Location not available on this device.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
        L.circle([latitude, longitude], { radius: 25, color: "#228B22" }).addTo(map);
      },
      () => { setLocating(false); alert("Could not get your location."); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  // Absolute overlay in map container (keeps it simple)
  return (
    <div style={{ position: "absolute", top: 10, right: 10, display: "grid", gap: 8, zIndex: 1000 }}>
      <button onClick={fitAll}
        className="px-3 py-2 rounded-lg bg-white border text-sm font-semibold hover:bg-slate-50"
        style={{ minHeight: 36 }}>Show all stops</button>

      <button onClick={locateMe}
        className="px-3 py-2 rounded-lg bg-white border text-sm font-semibold hover:bg-slate-50"
        style={{ minHeight: 36 }}>{locating ? "Locating…" : "Locate me"}</button>
    </div>
  );
}
