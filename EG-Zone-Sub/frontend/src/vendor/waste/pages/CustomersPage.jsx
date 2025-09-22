import { useEffect, useState } from 'react'
import { getCustomers, getZones, createCustomer } from '../api'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', zone: '' })

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const [c, z] = await Promise.all([getCustomers(), getZones()])
      setCustomers(c)
      setZones(z)
    } catch (e) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  async function onSubmit(e) {
    e.preventDefault()
    try {
      await createCustomer(form)
      setForm({ name: '', email: '', phone: '', zone: '' })
      await refresh()
    } catch (e) {
      setError('Failed to create customer')
    }
  }

  return (
    <div>
      <h3>Customers</h3>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
        <input placeholder="Name" value={form.name} onChange={(e) => setForm(v => ({ ...v, name: e.target.value }))} required />
        <input placeholder="Email" value={form.email} onChange={(e) => setForm(v => ({ ...v, email: e.target.value }))} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm(v => ({ ...v, phone: e.target.value }))} />
        <select value={form.zone} onChange={(e) => setForm(v => ({ ...v, zone: e.target.value }))}>
          <option value="">(No zone)</option>
          {zones.map(z => (
            <option key={z._id || z.id} value={z._id || z.id}>{z.name}</option>
          ))}
        </select>
        <button type="submit">Add Customer</button>
      </form>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {customers.map(c => (
          <li key={c._id || c.id}>{c.name} — {c.zone?.name || 'Unassigned'}</li>
        ))}
      </ul>
    </div>
  )
}


