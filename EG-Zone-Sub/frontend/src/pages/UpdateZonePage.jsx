import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getZones, updateZone, updateZoneGeometry } from '../api'
import L from 'leaflet'
import DrawZoneMini from './components/DrawZoneMini'

export default function UpdateZonePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', areaType: 'Urban', description: '', polygon: null })

  useEffect(() => {
    async function loadZone() {
      try {
        const zonesData = await getZones()
        setZones(zonesData)
        
        const zone = zonesData.find(z => z._id === id || z.id === id)
        if (!zone) {
          alert('Zone not found')
          navigate('/zones')
          return
        }

        setForm({
          name: zone.name || '',
          areaType: zone.areaType || zone.type || 'Urban',
          description: zone.description || '',
          polygon: zone.polygon || zone.geometry || null
        })
      } catch (e) {
        setError('Failed to load zone data')
      } finally {
        setLoading(false)
      }
    }

    loadZone()
  }, [id, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Save non-geometry fields first
      const nonGeom = { name: form.name, areaType: form.areaType, description: form.description }
      const result = await updateZone(id, nonGeom)
      // Save polygon via geometry endpoint to ensure write
      if (form.polygon) {
        await updateZoneGeometry(id, form.polygon)
      }
      alert('You have updated your data successfully')
      
      // Dispatch custom event to notify other components about the zone update
      window.dispatchEvent(new CustomEvent('zoneUpdated', { 
        detail: { zone: result.zone || result, zoneId: id } 
      }))
      
      navigate('/zones')
    } catch (e) {
      alert('Sorry cannot update data right now. Please try again')
      setError('Failed to update zone')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    navigate('/zones')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* Back button */}
      <div style={{ marginBottom: '16px' }}>
        <button 
          type="button"
          onClick={handleBack}
          className="btn"
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white',
            marginBottom: '16px'
          }}
        >
          ← Back to Zones
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Update Zone</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 20 }}>
          <form onSubmit={handleSubmit} className="form">
            <input 
              placeholder="Name" 
              value={form.name} 
              onChange={(e) => setForm(v => ({ ...v, name: e.target.value }))} 
              required 
            />
            <select 
              value={form.type} 
          onChange={(e) => setForm(v => ({ ...v, areaType: e.target.value }))}
            >
              <option>Urban</option>
              <option>Rural</option>
              <option>Suburban</option>
            </select>
            <input 
              placeholder="Description" 
              value={form.description} 
              onChange={(e) => setForm(v => ({ ...v, description: e.target.value }))} 
            />
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={saving || !form.polygon}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {!form.polygon && <div className="muted">Draw a polygon to enable Save.</div>}
            {error && <div style={{ color: 'salmon' }}>{error}</div>}
          </form>
          <DrawZoneMini 
            onGeometryChange={(g) => setForm(v => ({ ...v, polygon: g }))} 
            height={350}
            initialGeometry={form.polygon}
            showExistingZones={false}
          />
        </div>
      </div>
    </div>
  )
}
