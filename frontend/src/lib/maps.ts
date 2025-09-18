// Simple Google Maps directions link builder
export function googleMapsDirectionsUrl(lat: number, lng: number, label?: string) {
  // Using origin=Current+Location lets Google Maps use the user's current position
  const origin = "origin=Current+Location";
  const destination = `destination=${encodeURIComponent(`${lat},${lng}`)}`;
  const travel = "travelmode=driving";
  // (Optional) add a label in the query so it’s visible in the UI
  const query = label ? `&destination_place_id=&query=${encodeURIComponent(label)}` : "";
  return `https://www.google.com/maps/dir/?api=1&${origin}&${destination}&${travel}${query}`;
}

export function openGoogleMapsDirections(lat: number, lng: number, label?: string) {
  const url = googleMapsDirectionsUrl(lat, lng, label);
  window.open(url, "_blank", "noopener,noreferrer");
}
