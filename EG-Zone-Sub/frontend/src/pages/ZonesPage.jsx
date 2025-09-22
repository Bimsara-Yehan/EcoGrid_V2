import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getZones, createZone, deleteZone, getSubscriptionsByZone } from '../api'
import DrawZoneMini from './components/DrawZoneMini'

export default function ZonesPage() {
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', areaType: 'Urban', description: '', polygon: null })

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      setZones(await getZones())
    } catch (e) {
      setError('Failed to load zones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    console.log('ZonesPage - Form submitted with data:', form)
    
    if (!form.polygon) {
      console.error('ZonesPage - No polygon in form')
      setError('Please draw a zone on the map first')
      return
    }
    
    try {
      console.log('ZonesPage - Calling createZone API...')
      const result = await createZone(form)
      console.log('ZonesPage - Zone created successfully:', result)
      
      setForm({ name: '', areaType: 'Urban', description: '', polygon: null })
      await refresh()
      
      // Dispatch custom event to notify other components about the new zone
      window.dispatchEvent(new CustomEvent('zoneCreated', { 
        detail: { zone: result.zone || result } 
      }))
      
      setError('') // Clear any previous errors
    } catch (e) {
      console.error('ZonesPage - Error creating zone:', e)
      setError(`Failed to create zone: ${e.message}`)
    }
  }

  async function handleEditZone(zoneId) {
    navigate(`/zones/edit/${zoneId}`)
  }

  async function handleDeleteZone(zoneId) {
    try {
      // Check if zone has assigned subscriptions
      const subscriptions = await getSubscriptionsByZone(zoneId)
      
      let confirmMessage = "Are you sure you want to delete the zone data?"
      if (subscriptions && subscriptions.length > 0) {
        confirmMessage = "There are Subscriptions that are assigned to this zone. Are you sure you want to delete this zone?"
      }

      if (window.confirm(confirmMessage)) {
        await deleteZone(zoneId)
        alert("The zone deleted successfully.")
        await refresh()
        
        // Dispatch custom event to notify other components about the zone deletion
        window.dispatchEvent(new CustomEvent('zoneDeleted', { 
          detail: { zoneId } 
        }))
      }
    } catch (e) {
      alert("Sorry cannot delete data right now. Please try again")
      console.error('Delete zone error:', e)
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add Zone</h3>
        <div className="grid-2-responsive">
          <form onSubmit={onSubmit} className="form">
            <input placeholder="Name" value={form.name} onChange={(e) => setForm(v => ({ ...v, name: e.target.value }))} required />
            <select value={form.areaType} onChange={(e) => setForm(v => ({ ...v, areaType: e.target.value }))}>
              <option>Urban</option>
              <option>Rural</option>
              <option>Suburban</option>
            </select>
            <input placeholder="Description" value={form.description} onChange={(e) => setForm(v => ({ ...v, description: e.target.value }))} />
            <button type="submit" className="btn btn-primary" disabled={!form.polygon}>Create Zone</button>
            {!form.polygon && <div className="muted">Draw a polygon to enable Create.</div>}
          </form>
          <DrawZoneMini onGeometryChange={(g) => {
            console.log('ZonesPage - Geometry received:', g)
            setForm(v => ({ ...v, polygon: g }))
          }} height={360} />
        </div>
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Zones</h3>
        </div>
        {loading && <div>Loading…</div>}
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
        <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customers</th>
              <th style={{ padding: '12px 16px', textAlign: 'left' }} className="muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map(z => (
              <tr key={z._id || z.id}>
                <td style={{ padding: '12px 16px' }}>{z.name}</td>
                <td style={{ padding: '12px 16px' }}>{z.areaType}</td>
                <td style={{ padding: '12px 16px' }}>{z.description || '-'}</td>
                <td style={{ padding: '12px 16px' }}>{z.customersCount || 0}</td>
                <td style={{ padding: '12px 16px' }} className="muted">
                  <button 
                    className="btn" 
                    onClick={() => handleEditZone(z._id || z.id)}
                    style={{ marginRight: '8px' }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn" 
                    onClick={() => handleDeleteZone(z._id || z.id)}
                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!loading && zones.length === 0 && <div className="muted">No zones yet.</div>}
      </div>
    </div>
  )
}


