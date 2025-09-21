import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getZones, getSubscriptions, createSubscription, deleteSubscription } from '../api'

export default function SubsPage() {
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    planName: '',
    zoneId: '',
    frequency: 'weekly',
    price: '',
    description: '',
    wasteCategory: '',
    maxWeightPerPickupKg: '',
    active: true
  })

  const[success, setSuccess] = useState(false)
  const [selectedSub, setSelectedSub] = useState(null)
  
  async function refresh() {
    setLoading(true)
    try {
      const [z, s] = await Promise.all([getZones(), getSubscriptions()])
      setZones(z || [])
      setSubs(s || [])
      setError('') //Clear error only on Success
    } catch (e) {
      setError('Failed to load data')
      console.error('Refresh error:', e) //Log error for debugging
      setZones([])
      setSubs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])
  useEffect(() => {
       if (selectedSub) {
         document.body.style.overflow = 'hidden'; // Disable scrolling
       } else {
         document.body.style.overflow = ''; // Restore scrolling
       }
       return () => {
         document.body.style.overflow = ''; // Cleanup on unmount
       };
     }, [selectedSub]);

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        maxWeightPerPickupKg: form.maxWeightPerPickupKg ? Number(form.maxWeightPerPickupKg) : null,
        wasteCategory: form.wasteCategory || null
      }
      await createSubscription(payload)
      setSuccess(true)
      setForm({
        planName: '',
        zoneId: '',
        frequency: 'weekly',
        price: '',
        description: '',
        wasteCategory: '',
        maxWeightPerPickupKg: '',
        active: true
      })
      await refresh()
    } catch (e) {
      setError('Failed to create subscription')
    }
  }
    useEffect(() => {
        if (success) {
          alert('Your new Subscription plan has been created successfully')
          setSuccess(false) // Reset to prevent re-trigger on refresh
        }
      }, [success])

  async function handleEditSubscription(subscriptionId) {
    navigate(`/subscriptions/edit/${subscriptionId}`)
  }

  async function handleDeleteSubscription(subscriptionId) {
    try {
      if (window.confirm("Are you sure you want to delete this subscription?")) {
        await deleteSubscription(subscriptionId)
        alert("The subscription deleted successfully.")
        await refresh()
      }
    } catch (e) {
      alert("Sorry cannot delete data right now. Please try again")
      console.error('Delete subscription error:', e)
    }
  }
   function handleViewSubscription(sub) {
       setSelectedSub(sub)
     }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add Subscription Plan</h3>
        <form onSubmit={onSubmit} className="form">
          <input 
            placeholder="Plan name (e.g., Urban Weekly Basic)" 
            value={form.planName} 
            onChange={(e) => setForm(v => ({ ...v, planName: e.target.value }))} 
            required 
          />
          
          <select 
            value={form.zoneId} 
            onChange={(e) => setForm(v => ({ ...v, zoneId: e.target.value }))}
            required
          >
            <option value="">Select Zone</option>
            {zones.map(z => (
              <option key={z._id || z.id} value={z._id || z.id}>
                {z.name} ({z.areaType})
              </option>
            ))}
          </select>

          <select 
            value={form.frequency} 
            onChange={(e) => setForm(v => ({ ...v, frequency: e.target.value }))}
            required
          >
            <option value="weekly">Weekly</option>
            <option value="bi-weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <input 
            type="number" 
            placeholder="Price" 
            value={form.price} 
            onChange={(e) => setForm(v => ({ ...v, price: e.target.value }))} 
            min="0"
            step="0.01"
            required
          />

          <textarea 
            placeholder="Description (optional)" 
            value={form.description} 
            onChange={(e) => setForm(v => ({ ...v, description: e.target.value }))}
            rows="3"
          />

          <input 
            type="number" 
            placeholder="Max weight per pickup (kg, optional)" 
            value={form.maxWeightPerPickupKg} 
            onChange={(e) => setForm(v => ({ ...v, maxWeightPerPickupKg: e.target.value }))} 
            min="0"
          />

          <input 
            placeholder="Waste Category (optional)" 
            value={form.wasteCategory} 
            onChange={(e) => setForm(v => ({ ...v, wasteCategory: e.target.value }))}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input 
              type="checkbox" 
              checked={form.active} 
              onChange={(e) => setForm(v => ({ ...v, active: e.target.checked }))} 
            />
            Active Plan
          </label>

          <button type="submit" className="btn btn-primary">Create Subscription Plan</button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Subscription Plans</h3>
        {loading && <div>Loading subscriptions…</div>}
        {error && <div style={{ color: 'salmon' }}>{error}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>Plan Name</th>
              <th>Zone</th>
              <th>Zone Type</th>
              <th>Frequency</th>
              <th>Price</th>
              <th>Max Weight</th>
              <th>Status</th>
              <th className="muted">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s._id || s.id}>
                <td>{s.planName}</td>
                <td>{s.zoneId?.name || 'N/A'}</td>
                <td>{s.zoneId?.areaType || 'N/A'}</td>
                <td>{s.frequency}</td>
                <td>${s.price?.toFixed(2) || '0.00'}</td>
                <td>{s.maxWeightPerPickupKg ? `${s.maxWeightPerPickupKg} kg` : 'No limit'}</td>
                <td>
                  <span style={{ 
                    color: s.active ? 'green' : 'red',
                    fontWeight: 'bold'
                  }}>
                    {s.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="muted">
                  <button 
                    className="btn" 
                    onClick={() => handleEditSubscription(s._id || s.id)}
                    style={{ marginRight: '8px' }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn" 
                    onClick={() => handleDeleteSubscription(s._id || s.id)}
                    style={{ backgroundColor: '#dc3545', color: 'white' }}
                  >
                    Delete
                  </button>
                  <button 
                      className="btn" 
                      onClick={() => handleViewSubscription(s)}
                      style={{ marginLeft: '8px' }}
                 >
                       View
                 </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && subs.length === 0 && <div className="muted">No subscription plans yet.</div>}
        {selectedSub && (
         <div style={{
           position: 'fixed',
           top: 0,
           left: 0,
           width: '100%',
           height: '100%',
           background: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay for blur effect
           zIndex: 999,
           display: 'flex',
           justifyContent: 'center',
           alignItems: 'center'
         }}>
           <div style={{
             position: 'relative',
             background: 'white',
             padding: '20px',
             border: '1px solid #ccc',
             boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
             zIndex: 1000
           }}>
             <h3>Subscription Details</h3>
             <p><strong>Plan Name:</strong> {selectedSub.planName}</p>
             <p><strong>Zone:</strong> {selectedSub.zoneId?.name || 'N/A'}</p>
             <p><strong>Zone Type:</strong> {selectedSub.zoneId?.areaType || 'N/A'}</p>
             <p><strong>Frequency:</strong> {selectedSub.frequency}</p>
             <p><strong>Price:</strong> ${selectedSub.price?.toFixed(2) || '0.00'}</p>
             <p><strong>Max Weight:</strong> {selectedSub.maxWeightPerPickupKg ? `${selectedSub.maxWeightPerPickupKg} kg` : 'No limit'}</p>
             <p><strong>Waste Category:</strong> {selectedSub.wasteCategory || 'N/A'}</p>
             <p><strong>Status:</strong> <span style={{ color: selectedSub.active ? 'green' : 'red', fontWeight: 'bold' }}>{selectedSub.active ? 'Active' : 'Inactive'}</span></p>
             <p><strong>Description:</strong> {selectedSub.description || 'N/A'}</p>
             <button 
               className="btn" 
               onClick={() => setSelectedSub(null)}
               style={{ marginTop: '10px' }}
             >
               Close
             </button>
           </div>
         </div>
       )}
      </div>
    </div>
  )
}


