import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useZoneMap, ZONE_COLORS, customerIcon, KANDY_BOUNDS,KANDY_CENTER } from '../hooks/useZoneMap'

export default function MapView() {
  const [hoveredCustomer, setHoveredCustomer] = useState(null)

  // Use shared hook with zone display only (no creation)
  const {
    zones,
    customers,
    loading,
    error,
    hoveredCustomer: hookHoveredCustomer,
    setHoveredCustomer: setHookHoveredCustomer,
    loadData
  } = useZoneMap({
    enableZoneCreation: false,
    enableCustomerDisplay: true
  })

  // Refresh data when component mounts to ensure latest zones are displayed
  useEffect(() => {
    loadData()
  }, [loadData])

  // Refresh data when page becomes visible (user navigates back to this page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [loadData])

  // Listen for zone creation events from other components
  useEffect(() => {
    const handleZoneCreated = () => {
      // Refresh data when a new zone is created elsewhere
      loadData()
    }

    const handleZoneDeleted = () => {
      // Refresh data when a zone is deleted elsewhere
      loadData()
    }

    const handleZoneUpdated = () => {
      // Refresh data when a zone is updated elsewhere
      loadData()
    }

    window.addEventListener('zoneCreated', handleZoneCreated)
    window.addEventListener('zoneDeleted', handleZoneDeleted)
    window.addEventListener('zoneUpdated', handleZoneUpdated)
    return () => {
      window.removeEventListener('zoneCreated', handleZoneCreated)
      window.removeEventListener('zoneDeleted', handleZoneDeleted)
      window.removeEventListener('zoneUpdated', handleZoneUpdated)
    }
  }, [loadData])



  // Filter zones that have valid polygon
  const zonesWithGeometry = zones.filter(z => 
    z.polygon && 
    z.polygon.coordinates && 
    Array.isArray(z.polygon.coordinates[0]) &&
    z.polygon.coordinates[0].length > 0
  )

  // Debug logging
  useEffect(() => {
    console.log('MapView - Total zones loaded:', zones.length)
    console.log('MapView - Raw zones data:', zones)
    console.log('MapView - Zones with valid geometry:', zonesWithGeometry.length)
    
    // Log each zone in detail
    zones.forEach((zone, index) => {
      console.log(`MapView - Zone ${index + 1} (Raw):`, {
        id: zone._id || zone.id,
        name: zone.name,
        areaType: zone.areaType,
        hasPolygon: !!zone.polygon,
        polygonType: zone.polygon?.type,
        coordinatesLength: zone.polygon?.coordinates?.[0]?.length || 0,
        fullPolygon: zone.polygon
      })
    })
    
    // Log filtered zones
    zonesWithGeometry.forEach((zone, index) => {
      console.log(`MapView - Zone ${index + 1} (Filtered):`, {
        id: zone._id || zone.id,
        name: zone.name,
        areaType: zone.areaType,
        color: ZONE_COLORS[zone.areaType],
        coordinates: zone.polygon?.coordinates?.[0]?.length || 0
      })
    })
  }, [zones, zonesWithGeometry])

  return (
    <div style={{ 
      height: 'calc(100vh - 120px)', 
      position: 'relative',
      width: '100vw',
      marginLeft: '-20px',
      marginRight: '-20px'
    }}>
      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, padding: '0 20px' }}>
        <button className="btn" onClick={loadData} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button className="btn" onClick={() => {
          console.log('Manual API test...')
          fetch('/Zones')
            .then(res => {
              console.log('API Response status:', res.status)
              console.log('API Response headers:', res.headers)
              if (!res.ok) {
                return res.text().then(text => {
                  console.error('API Error Response:', text)
                  throw new Error(`HTTP ${res.status}: ${text}`)
                })
              }
              return res.json()
            })
            .then(data => {
              console.log('Manual API Response:', data)
              console.log('Zones array:', data.zones)
              console.log('Zones count:', data.zones?.length || 0)
            })
            .catch(err => console.error('Manual API Error:', err))
        }}>
          🔍 Test API
        </button>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        top: '60px',
        right: '20px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        minWidth: '150px',
        color: '#000000'
      }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#000000' }}>Zone Types</h4>
        {Object.entries(ZONE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: color,
              marginRight: '8px',
              borderRadius: '2px'
            }}></div>
            <span style={{ fontSize: '12px', color: '#000000' }}>{type}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: '#ff6b35',
              marginRight: '8px',
              borderRadius: '50%'
            }}></div>
            <span style={{ fontSize: '12px', color: '#000000' }}>Customers</span>
          </div>
        </div>
        
        {/* Zone Status */}
        <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }}>
          <div style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>
            {loading ? 'Loading zones...' : `${zonesWithGeometry.length} zones displayed`}
          </div>
          {/* Debug info - remove this after fixing */}
          <div style={{ fontSize: '10px', color: '#999', textAlign: 'center', marginTop: '4px' }}>
            Total loaded: {zones.length} | Raw data: {zones.length > 0 ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      <MapContainer 
        center={KANDY_CENTER} 
        zoom={13} 
        style={{ 
          height: '100%', 
          width: '100%',
          minWidth: '100vw'
        }}
        maxBounds={KANDY_BOUNDS}
        maxBoundsViscosity={1.0}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Display existing zones */}
        {zonesWithGeometry.map(z => (
          <Polygon
            key={z._id || z.id}
            positions={z.polygon.coordinates[0].map(([lng, lat]) => [lat, lng])}
            pathOptions={{ 
              color: ZONE_COLORS[z.areaType] || '#666',
              fillColor: ZONE_COLORS[z.areaType] || '#666',
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Tooltip permanent={false} direction="top">
              <div style={{ textAlign: 'center' }}>
                <strong>{z.name}</strong><br/>
                Type: {z.areaType}<br/>
                {z.description && `${z.description}<br/>`}
                Customers: {z.customersCount || 0}
              </div>
            </Tooltip>
          </Polygon>
        ))}

        {/* Display customers with hover information */}
        {customers.map(c => (
          c.location?.lat && c.location?.lng ? (
            <Marker 
              key={c._id || c.id} 
              position={[c.location.lat, c.location.lng]}
              icon={customerIcon}
              eventHandlers={{
                mouseover: () => setHookHoveredCustomer(c),
                mouseout: () => setHookHoveredCustomer(null)
              }}
            >
              <Tooltip permanent={false} direction="top">
                <div style={{ textAlign: 'center' }}>
                  <strong>{c.name}</strong><br/>
                  {c.email && `${c.email}<br/>`}
                  {c.phone && `${c.phone}<br/>`}
                  Zone: {c.zone?.name || 'Unassigned'}
                </div>
              </Tooltip>
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h4 style={{ margin: '0 0 8px 0' }}>{c.name}</h4>
                  {c.email && <p style={{ margin: '4px 0' }}><strong>Email:</strong> {c.email}</p>}
                  {c.phone && <p style={{ margin: '4px 0' }}><strong>Phone:</strong> {c.phone}</p>}
                  <p style={{ margin: '4px 0' }}><strong>Zone:</strong> {c.zone?.name || 'Unassigned'}</p>
                  {c.address && <p style={{ margin: '4px 0' }}><strong>Address:</strong> {c.address}</p>}
                </div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>

      {/* Customer hover info panel */}
      {hookHoveredCustomer && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxWidth: '250px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{hookHoveredCustomer.name}</h4>
          {hookHoveredCustomer.email && <p style={{ margin: '4px 0', fontSize: '12px' }}>📧 {hookHoveredCustomer.email}</p>}
          {hookHoveredCustomer.phone && <p style={{ margin: '4px 0', fontSize: '12px' }}>📞 {hookHoveredCustomer.phone}</p>}
          <p style={{ margin: '4px 0', fontSize: '12px' }}>📍 Zone: {hookHoveredCustomer.zone?.name || 'Unassigned'}</p>
          {hookHoveredCustomer.address && <p style={{ margin: '4px 0', fontSize: '12px' }}>🏠 {hookHoveredCustomer.address}</p>}
        </div>
      )}
    </div>
  )
}


