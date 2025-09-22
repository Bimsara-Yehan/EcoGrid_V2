import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { useZoneMap, ZONE_COLORS, KANDY_BOUNDS, KANDY_CENTER } from '../../hooks/useZoneMap'
import L from 'leaflet'
import DrawControl from '../../components/DrawControl'

export default function DrawZoneMini({ 
  onGeometryChange, 
  height = 320, 
  showExistingZones = true,
  initialGeometry = null, // For editing existing zones
  zoneData = {} // Form data from parent component
}) {
  const [drawnGeometry, setDrawnGeometry] = useState(initialGeometry)
  const [mapKey, setMapKey] = useState(Date.now()) // Force re-render
  const mapRef = useRef(null)
  
  // Use shared hook with zone creation enabled
  const {
    zones,
    loading,
    error,
    loadData,
    handleZoneCreation
  } = useZoneMap({
    enableZoneCreation: true,
    enableCustomerDisplay: false, // Mini map doesn't show customers
    onZoneCreated: (zone) => {
      // Callback when zone is created successfully
      console.log('Zone created:', zone)
    }
  })

  // Update drawnGeometry when initialGeometry changes
  useEffect(() => {
    if (initialGeometry) {
      // Only mirror initial geometry locally; do NOT echo back to parent to avoid loops
      setDrawnGeometry(initialGeometry)
      // Fit map to the provided geometry
      try {
        const ring = initialGeometry.coordinates?.[0]
        if (mapRef.current && Array.isArray(ring) && ring.length > 1) {
          const latLngs = ring.map(([lng, lat]) => [lat, lng])
          const bounds = L.latLngBounds(latLngs)
          mapRef.current.fitBounds(bounds, { padding: [20, 20] })
        }
      } catch (_) {}
    }
  }, [initialGeometry])

  const handleDrawCreated = async (layer) => {
    console.log('DrawZoneMini - Layer created:', layer)
    console.log('DrawZoneMini - Layer type:', layer.constructor.name)
    
    try {
      let ring
      if (layer instanceof L.Polygon) {
        ring = layer.getLatLngs()[0].map(({ lat, lng }) => [lng, lat])
      } else if (layer instanceof L.Rectangle) {
        const bounds = layer.getBounds()
        ring = [
          [bounds.getWest(), bounds.getSouth()],
          [bounds.getEast(), bounds.getSouth()],
          [bounds.getEast(), bounds.getNorth()],
          [bounds.getWest(), bounds.getNorth()],
          [bounds.getWest(), bounds.getSouth()] // Close the ring
        ]
      } else if (layer instanceof L.Circle) {
        const center = layer.getLatLng()
        const radius = layer.getRadius()
        // Convert circle to polygon approximation
        const points = []
        for (let i = 0; i < 32; i++) {
          const angle = (i / 32) * 2 * Math.PI
          const lat = center.lat + (radius / 111320) * Math.cos(angle)
          const lng = center.lng + (radius / (111320 * Math.cos(center.lat * Math.PI / 180))) * Math.sin(angle)
          points.push([lng, lat])
        }
        points.push(points[0]) // Close the ring
        ring = points
      } else {
        console.error('DrawZoneMini - Unsupported layer type:', layer.constructor.name)
        return
      }
      
      // Ensure closed linear ring per GeoJSON spec
      if (ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring = [...ring, ring[0]]
      }
      
      const geometry = { type: 'Polygon', coordinates: [ring] }
      console.log('DrawZoneMini - Created geometry:', geometry)
      setDrawnGeometry(geometry)
      
      // Pass geometry to parent component
      if (onGeometryChange) {
        console.log('DrawZoneMini - Calling onGeometryChange with:', geometry)
        onGeometryChange(geometry)
      }
    } catch (error) {
      console.error('DrawZoneMini - Error processing layer:', error)
    }
  }

  const handleDrawEdited = (layers) => {
    layers.eachLayer((layer) => {
      const ring = layer.getLatLngs()[0].map(({ lat, lng }) => [lng, lat])
      const closed = ring.length && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1]) ? [...ring, ring[0]] : ring
      const geometry = { type: 'Polygon', coordinates: [closed] }
      setDrawnGeometry(geometry)
      
      if (onGeometryChange) {
        onGeometryChange(geometry)
      }
    })
  }

  const handleDrawDeleted = () => {
    setDrawnGeometry(null)
    if (onGeometryChange) {
      onGeometryChange(null)
    }
  }

  // Filter zones that have valid polygon
  const zonesWithGeometry = zones.filter(z => 
    z.polygon && 
    z.polygon.coordinates && 
    Array.isArray(z.polygon.coordinates[0]) &&
    z.polygon.coordinates[0].length > 0
  )

  return (
    <div 
      style={{
        width: '100%',
        height,
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '2px solid #e0e0e0'
      }}
    >
      <MapContainer 
        key={mapKey}
        center={KANDY_CENTER} 
        zoom={13} 
        style={{ 
          height: '100%', 
          width: '100%'
        }}
        maxBounds={KANDY_BOUNDS}
        maxBoundsViscosity={1.0}
        whenCreated={(map) => { mapRef.current = map }}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Draw Control for creating new zones */}
        <DrawControl 
          onCreated={handleDrawCreated}
          onEdited={handleDrawEdited}
          onDeleted={handleDrawDeleted}
          initialGeometry={initialGeometry}
          editOnly={!!initialGeometry}
        />

        {/* Display existing zones if enabled */}
        {showExistingZones && zonesWithGeometry.map(z => (
          <Polygon
            key={z._id || z.id}
            positions={z.polygon.coordinates[0].map(([lng, lat]) => [lat, lng])}
            pathOptions={{ 
              color: ZONE_COLORS[z.areaType] || '#666',
              fillColor: ZONE_COLORS[z.areaType] || '#666',
              fillOpacity: 0.3, // Increased opacity for better visibility
              weight: 2 // Thicker lines for better visibility
            }}
          >
            <Tooltip permanent={false} direction="top">
              <div style={{ textAlign: 'center', fontSize: '11px' }}>
                <strong>{z.name}</strong><br/>
                Type: {z.areaType}
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* Display the zone being edited */}
        {initialGeometry && initialGeometry.coordinates && (
          <Polygon
            positions={initialGeometry.coordinates[0].map(([lng, lat]) => [lat, lng])}
            pathOptions={{ 
              color: '#ff4757',
              fillColor: '#ff4757',
              fillOpacity: 0.4,
              weight: 3,
              dashArray: '5, 5'
            }}
          >
            <Tooltip permanent={false} direction="top">
              <div style={{ textAlign: 'center', fontSize: '11px' }}>
                <strong>Current Zone</strong><br/>
                Click Edit tool to modify
              </div>
            </Tooltip>
          </Polygon>
        )}
      </MapContainer>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '6px',
        fontSize: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <strong>Drawing Tools:</strong><br/>
        • Click polygon tool (left side)<br/>
        • Draw zone boundary<br/>
        • Double-click to finish<br/>
        {initialGeometry && '• Use Edit tool to modify existing'}
      </div>

      {/* Status indicator */}
      {drawnGeometry && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          backgroundColor: '#22c55e',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          zIndex: 1000
        }}>
          ✓ Zone area {initialGeometry ? 'updated' : 'drawn'}
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          Loading...
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '6px 10px',
          borderRadius: '6px',
          fontSize: '11px',
          zIndex: 1000
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

