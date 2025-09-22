import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getZones, getSubscriptions, updateSubscription } from '../api'

export default function UpdateSubscriptionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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

  useEffect(() => {
    async function loadSubscription() {
      try {
        const [zonesData, subsData] = await Promise.all([getZones(), getSubscriptions()])
        setZones(zonesData)
        setSubscriptions(subsData)
        
        const subscription = subsData.find(s => s._id === id || s.id === id)
        if (!subscription) {
          alert('Subscription not found')
          navigate('/subscriptions')
          return
        }

        setForm({
          planName: subscription.planName || '',
          zoneId: subscription.zoneId?._id || subscription.zoneId || '',
          frequency: subscription.frequency || 'weekly',
          price: subscription.price?.toString() || '',
          description: subscription.description || '',
          wasteCategory: subscription.wasteCategory || '',
          maxWeightPerPickupKg: subscription.maxWeightPerPickupKg?.toString() || '',
          active: subscription.active !== undefined ? subscription.active : true
        })
      } catch (e) {
        setError('Failed to load subscription data')
      } finally {
        setLoading(false)
      }
    }

    loadSubscription()
  }, [id, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        maxWeightPerPickupKg: form.maxWeightPerPickupKg ? Number(form.maxWeightPerPickupKg) : undefined,
        wasteCategory: form.wasteCategory || undefined
      }
      
      await updateSubscription(id, payload)
      alert('You have updated your data successfully')
      navigate('/subscriptions')
    } catch (e) {
      alert('Sorry cannot update data right now. Please try again')
      setError('Failed to update subscription')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    navigate('/subscriptions')
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={handleBack}
          className="btn"
          style={{ 
            backgroundColor: '#6c757d', 
            color: 'white',
            marginBottom: '16px'
          }}
        >
          ← Back to Subscriptions
        </button>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Update Subscription Plan</h3>
        <form onSubmit={handleSubmit} className="form">
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

          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {error && <div style={{ color: 'salmon' }}>{error}</div>}
        </form>
      </div>
    </div>
  )
}