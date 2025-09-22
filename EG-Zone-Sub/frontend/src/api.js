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
    // Standardized response format: always return array
    const zones = Array.isArray(data.zones) ? data.zones : Array.isArray(data) ? data : []
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

export async function getCustomerSubscriptions() {
  const res = await fetch('/api/subscriptions/customers')
  if (!res.ok) throw new Error('Failed to load customer subscriptions')
  const data = await res.json()
  return data || []
}

// Zone management functions
export async function deleteZone(zoneId) {
  const res = await fetch(`/api/Zones/${zoneId}`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to delete zone')
  return await res.json()
}

export async function reassignCustomersToZone(fromZoneId, toZoneId, customerIds = null) {
  const res = await fetch('/api/Zones/reassign-customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromZoneId, toZoneId, customerIds })
  })
  if (!res.ok) throw new Error('Failed to reassign customers')
  return await res.json()
}

export async function getCustomersInZone(zoneId) {
  const res = await fetch(`/api/Zones/${zoneId}/customers-in-zone`)
  if (!res.ok) throw new Error('Failed to load customers in zone')
  const data = await res.json()
  return data || []
}

// Subscription soft delete functions
export async function softDeleteSubscription(subscriptionId, reason = 'admin_cancelled', deletedBy = null) {
  const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, deletedBy })
  })
  if (!res.ok) throw new Error('Failed to soft delete subscription')
  return await res.json()
}

export async function restoreSubscription(subscriptionId) {
  const res = await fetch(`/api/subscriptions/${subscriptionId}/restore`, {
    method: 'POST'
  })
  if (!res.ok) throw new Error('Failed to restore subscription')
  return await res.json()
}

export async function permanentDeleteSubscription(subscriptionId) {
  const res = await fetch(`/api/subscriptions/${subscriptionId}/permanent`, {
    method: 'DELETE'
  })
  if (!res.ok) throw new Error('Failed to permanently delete subscription')
  return await res.json()
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

