// Waste management service adapter
// Uses VITE_API_BASE_URL for API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }
  return response.json();
}

// Customer API calls
export async function getCustomers() {
  const response = await fetch(`${API_BASE_URL}/api/waste/customers`);
  return handleResponse(response);
}

export async function getCustomerById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/customers/${id}`);
  return handleResponse(response);
}

export async function createCustomer(customerData: any) {
  const response = await fetch(`${API_BASE_URL}/api/waste/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  return handleResponse(response);
}

export async function updateCustomer(id: string, customerData: any) {
  const response = await fetch(`${API_BASE_URL}/api/waste/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData)
  });
  return handleResponse(response);
}

export async function deleteCustomer(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/customers/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

// Zone API calls
export async function getZones() {
  const response = await fetch(`${API_BASE_URL}/api/waste/zones`);
  return handleResponse(response);
}

export async function getZoneById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/zones/${id}`);
  return handleResponse(response);
}

export async function createZone(zoneData: any) {
  const response = await fetch(`${API_BASE_URL}/api/waste/zones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zoneData)
  });
  return handleResponse(response);
}

export async function updateZone(id: string, zoneData: any) {
  const response = await fetch(`${API_BASE_URL}/api/waste/zones/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zoneData)
  });
  return handleResponse(response);
}

export async function deleteZone(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/zones/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function getCustomersForZone(zoneId: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/zones/${zoneId}/customers`);
  return handleResponse(response);
}

export async function updateZoneGeometry(id: string, geometryData: any) {
  const response = await fetch(`${API_BASE_URL}/api/waste/zones/${id}/geometry`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(geometryData)
  });
  return handleResponse(response);
}

// Subscription API calls
export async function getSubscriptions() {
  const response = await fetch(`${API_BASE_URL}/api/waste/subscriptions`);
  return handleResponse(response);
}

export async function getSubscriptionById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/subscriptions/${id}`);
  return handleResponse(response);
}

export async function createSubscription(subscriptionData: any) {
  const response = await fetch(`${API_BASE_URL}/api/waste/subscriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionData)
  });
  return handleResponse(response);
}

export async function updateSubscription(id: string, subscriptionData: any) {
  const response = await fetch(`${API_BASE_URL}/api/waste/subscriptions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriptionData)
  });
  return handleResponse(response);
}

export async function deleteSubscription(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/subscriptions/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export async function getSubscriptionsByZone(zoneId: string) {
  const response = await fetch(`${API_BASE_URL}/api/waste/subscriptions/zone/${zoneId}`);
  return handleResponse(response);
}

// Summary/Dashboard API call
export async function getSubscriptionSummary() {
  const response = await fetch(`${API_BASE_URL}/api/waste/summary`);
  return handleResponse(response);
}
