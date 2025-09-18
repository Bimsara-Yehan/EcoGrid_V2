import L from "leaflet";

// ✅ Use Vite-safe URLs so the PNGs always resolve (dev & build)
const iconUrl       = new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString();
const iconRetinaUrl = new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString();
const shadowUrl     = new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString();

// Some Leaflet builds keep an internal getter that ignores our URLs — remove it
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Export a concrete default icon we pass to every marker
export const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  tooltipAnchor:[16, -28],
  shadowSize:   [41, 41],
});
