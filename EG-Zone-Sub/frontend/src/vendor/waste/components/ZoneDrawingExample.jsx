import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import DrawControl from './DrawControl'
import { KANDY_CENTER, KANDY_BOUNDS } from '../hooks/useZoneMap'

// Example usage of the enhanced DrawControl
export default function ZoneDrawingExample() {
  const [zoneGeometry, setZoneGeometry] = useState(null)
  const [zoneData, setZoneData] = useState({
    name: '',
    type: 'Urban',
    description: ''
  })

  const handleShapeChange = (coordinates) => {
    console.log('Shape coordinates changed:', coordinates)
    setZoneGeometry(coordinates)
  }

  const handleShapeCreated = (shape) => {
    console.log('Shape created:', shape)
  }

  const handleShapeEdited = (layers) => {
    console.log('Shape edited:', layers)
  }

  const handleSaveZone = async () => {
    if (!zoneGeometry || zoneGeometry.length === 0) {
      alert('Please draw a zone first!')
      return
    }

    if (!zoneData.name.trim()) {
      alert('Please enter a zone name!')
      return
    }

    try {
      // Prepare zone data for MongoDB
      const zoneToSave = {
        name: zoneData.name,
        type: zoneData.type,
        description: zoneData.description,
        geometry: {
          type: 'Polygon',
          coordinates: [zoneGeometry[0].coordinates] // For polygon
        }
      }

      console.log('Saving zone:', zoneToSave)
      
      // Here you would call your API to save the zone
      // const response = await createZone(zoneToSave)
      
      alert('Zone saved successfully!')
      
      // Reset form
      setZoneData({
        name: '',
        type: 'Urban',
        description: ''
      })
      setZoneGeometry(null)
      
    } catch (error) {
      console.error('Error saving zone:', error)
      alert('Error saving zone')
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Zone Form */}
      <div style={{ 
        width: '300px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa',
        borderRight: '1px solid #dee2e6'
      }}>
        <h2>Create Zone</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Zone Name:
          </label>
          <input
            type="text"
            value={zoneData.name}
            onChange={(e) => setZoneData(prev => ({ ...prev, name: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px'
            }}
            placeholder="Enter zone name"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Zone Type:
          </label>
          <select
            value={zoneData.type}
            onChange={(e) => setZoneData(prev => ({ ...prev, type: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px'
            }}
          >
            <option value="Urban">Urban</option>
            <option value="Rural">Rural</option>
            <option value="Suburban">Suburban</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description:
          </label>
          <textarea
            value={zoneData.description}
            onChange={(e) => setZoneData(prev => ({ ...prev, description: e.target.value }))}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="Enter zone description"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleSaveZone}
            disabled={!zoneGeometry || zoneGeometry.length === 0 || !zoneData.name.trim()}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: zoneGeometry && zoneGeometry.length > 0 && zoneData.name.trim() ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: zoneGeometry && zoneGeometry.length > 0 && zoneData.name.trim() ? 'pointer' : 'not-allowed'
            }}
          >
            Save Zone
          </button>
        </div>

        {/* Drawing Instructions */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Drawing Tools:</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li><strong>⬟ Polygon:</strong> Click multiple points, double-click to finish</li>
            <li><strong>⬜ Rectangle:</strong> Click two corner points</li>
            <li><strong>⭕ Circle:</strong> Click center, then click radius</li>
            <li><strong>✏️ Edit:</strong> Edit existing shapes</li>
          </ul>
          <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#6c757d' }}>
            Press <strong>Escape</strong> to cancel drawing
          </p>
        </div>

        {/* Zone Geometry Info */}
        {zoneGeometry && zoneGeometry.length > 0 && (
          <div style={{ 
            marginTop: '15px',
            backgroundColor: 'white', 
            padding: '15px', 
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Zone Geometry:</h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#6c757d' }}>
              Type: {zoneGeometry[0].type}<br/>
              Points: {zoneGeometry[0].coordinates.length}
            </p>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer
          center={KANDY_CENTER}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          maxBounds={KANDY_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          
          <DrawControl
            onCreated={handleShapeCreated}
            onEdited={handleShapeEdited}
            onShapeChange={handleShapeChange}
            allowMultiple={false}
          />
        </MapContainer>
      </div>
    </div>
  )
}
