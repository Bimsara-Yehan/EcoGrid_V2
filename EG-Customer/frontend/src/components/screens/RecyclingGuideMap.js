import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Kandy area bounds (approximate)
const KANDY_BOUNDS = L.latLngBounds(
  L.latLng(7.0, 80.0),
  L.latLng(7.5, 81.0)
);

// Tighter city view for initial fit - expanded to include all stations
const KANDY_CITY_BOUNDS = L.latLngBounds(
  L.latLng(7.20, 80.50),
  L.latLng(7.40, 80.75)
);

const RecyclingGuideMap = ({
  mapCenter,
  userLocation,
  filteredStations,
  createCustomIcon,
  onSelectStation,
  getStatusColor,
  getStatusText,
  getFacilityIcon,
  getFacilityText,
}) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize map once
  useEffect(() => {
    if (!mapRef.current && containerRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center: mapCenter,
        zoom: 13,
        minZoom: 10,
        maxZoom: 18,
        maxBounds: KANDY_BOUNDS,
        maxBoundsViscosity: 1.0,
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        scrollWheelZoom: true,
        boxZoom: true,
        keyboard: true,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);

      // Default view to Kandy city bounds
      mapRef.current.fitBounds(KANDY_CITY_BOUNDS, { padding: [20, 20] });

      markersLayerRef.current = L.layerGroup().addTo(mapRef.current);
    }
  }, [mapCenter]);

  // Update center when mapCenter changes (kept within Kandy bounds)
  useEffect(() => {
    if (mapRef.current && mapCenter) {
      if (KANDY_BOUNDS.contains(L.latLng(mapCenter[0], mapCenter[1]))) {
        mapRef.current.setView(mapCenter, Math.max(mapRef.current.getZoom(), 13));
      } else {
        mapRef.current.fitBounds(KANDY_CITY_BOUNDS, { padding: [20, 20] });
      }
    }
  }, [mapCenter]);

  // Render markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    // User location marker (only if inside bounds)
    if (userLocation) {
      const ul = L.latLng(userLocation.lat, userLocation.lng);
      if (KANDY_BOUNDS.contains(ul)) {
        L.marker([userLocation.lat, userLocation.lng], {
          icon: L.divIcon({
            className: 'user-location-icon',
            html: `<div style="
              background-color: #3b82f6;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              color: white;
              font-weight: bold;
            ">📍</div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          title: 'Your Location',
        })
          .bindPopup(
            `<div style="text-align:center"><strong>Your Location</strong><br/><small>Lat: ${
              userLocation.lat?.toFixed?.(4) ?? userLocation.lat
            }, Lng: ${userLocation.lng?.toFixed?.(4) ?? userLocation.lng}</small></div>`
          )
          .addTo(layer);
      }
    }

    // Station markers (show all stations)
    (filteredStations || []).forEach((station) => {
      const lat = station?.location?.coordinates?.latitude;
      const lng = station?.location?.coordinates?.longitude;
      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(station.status, station.isOpen),
        title: station.name,
      }).addTo(layer);

      const facilitiesPreview = (station.facilities || [])
        .slice(0, 3)
        .map(
          (f) => `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:8px;background:#f3f4f6;color:#374151;font-size:12px;">${getFacilityIcon(
            f
          )} ${getFacilityText(f)}</span>`
        )
        .join(' ');

      const popupHtml = `
        <div style="min-width:250px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <h4 style="margin:0;font-weight:600;color:#111827;font-size:14px;">${station.name}</h4>
            <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
              <span style="padding:2px 6px;border-radius:9999px;font-size:12px;border:1px solid #d1d5db;">${getStatusText(
                station.status
              )}</span>
              <span style="padding:2px 6px;border-radius:9999px;font-size:11px;font-weight:500;${station.isOpen 
                ? 'background-color:#dcfce7;color:#166534;border:1px solid #bbf7d0;' 
                : 'background-color:#fef2f2;color:#dc2626;border:1px solid #fecaca;'
              }">
                ${station.isOpen ? '✓ Open Now' : '○ Closed'}
              </span>
            </div>
          </div>
          <p style="margin:0 0 8px 0;color:#4b5563;font-size:12px;">${station.description || ''}</p>
          <div style="display:flex;flex-direction:column;gap:4px;color:#4b5563;font-size:12px;">
            <div>${station?.location?.address || ''}</div>
            <div style="display:flex;align-items:center;gap:4px;">
              <span style="font-weight:500;">Hours:</span>
              <span>${station?.operatingHours?.open || '8:00 AM'} - ${station?.operatingHours?.close || '6:00 PM'}</span>
            </div>
            ${station?.operatingHours?.days && station.operatingHours.days.length > 0 
              ? `<div style="font-size:11px;color:#6b7280;">${station.operatingHours.days.join(', ')}</div>`
              : station?.operatingHours?.open && station?.operatingHours?.close 
                ? ''
                : '<div style="font-size:11px;color:#6b7280;">Monday - Sunday (default)</div>'
            }
            ${station?.distance ? `<div>${station.distance} km away</div>` : ''}
            <div>Capacity: ${station.currentLoad || 0}/${station.capacity || 0} kg</div>
          </div>
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;display:flex;gap:4px;flex-wrap:wrap;">${facilitiesPreview}</div>
          <div style="margin-top:12px;padding-top:8px;border-top:1px solid #e5e7eb;">
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}', '_blank')" 
                    style="width:100%;padding:8px 12px;background-color:#10b981;color:white;border:none;border-radius:6px;font-size:12px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:background-color 0.2s;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Open in Google Maps
            </button>
          </div>
        </div>`;

      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        if (typeof onSelectStation === 'function') onSelectStation(station);
      });
    });
  }, [filteredStations, userLocation, createCustomIcon, onSelectStation, getFacilityIcon, getFacilityText, getStatusText]);

  return <div ref={containerRef} style={{ height: '500px', width: '100%' }} />;
};

export default RecyclingGuideMap;
