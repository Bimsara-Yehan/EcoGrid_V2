export async function getZones() {
  try {
    const res = await fetch('/api/Zones')
    console.log('API Response status:', res.status)
    console.log('API Response headers:', res.headers)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('API Error Response:', errorText)
      throw new Error(`Failed to load zones: ${res.status} ${res.statusText}`)
    }
    
    const contentType = res.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await res.text()
      console.error('Non-JSON response:', responseText)
      throw new Error('API returned non-JSON response')
    }
    
    const data = await res.json()
    console.log('API Response - getZones:', data)
    // Handle both { zones: [...] } and [...] response formats
    const zones = data.zones || data || []
    console.log('Extracted zones:', zones)
    return zones
  } catch (error) {
    console.error('getZones error:', error)
    throw error
  }
}

export async function getSubscriptions() {
  const res = await fetch('/api/subscriptions')
  if (!res.ok) throw new Error('Failed to load subscriptions')
  const data = await res.json()
  return data || []
}

export async function createZone(zone) {
  const res = await fetch('/api/Zones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zone),
  })
  if (!res.ok) throw new Error('Failed to create zone')
  return await res.json()
}

export async function updateZone(id, zone) {
  const res = await fetch(`/api/Zones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zone),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to update zone')
  }
  return await res.json()
}

export async function deleteZone(id) {
  const res = await fetch(`/api/Zones/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to delete zone')
  }
  return await res.json()
}

export async function updateZoneGeometry(zoneId, geometry) {
  const res = await fetch(`/api/Zones/${zoneId}/geometry`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ geometry })
  })
  if (!res.ok) throw new Error('Failed to save geometry')
  return await res.json()
}

export async function createSubscription(subscription) {
  const res = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to create subscription')
  }
  return await res.json()
}

export async function updateSubscription(id, subscription) {
  const res = await fetch(`/api/subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to update subscription')
  }
  return await res.json()
}

export async function deleteSubscription(id) {
  const res = await fetch(`/api/subscriptions/${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to delete subscription')
  }
  return await res.json()
}

export async function getSubscriptionsByZone(zoneId) {
  const res = await fetch(`/api/subscriptions/zone/${zoneId}`)
  if (!res.ok) throw new Error('Failed to load subscriptions for zone')
  const data = await res.json()
  return data || []
}

export async function getCustomers() {
  const res = await fetch('/api/customers')
  if (!res.ok) throw new Error('Failed to load customers')
  return await res.json()
}

export async function createCustomer(customer) {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer),
  })
  if (!res.ok) throw new Error('Failed to create customer')
  return await res.json()
}

// Ensure this exists or update if needed
export async function getSubscriptionSummary() {
  const res = await fetch('/api/subscriptions/summary');
  if (!res.ok) throw new Error('Failed to load subscription summary');
  return await res.json();
}

