// Staff Management Service Adapter
// Wraps API calls and reads from environment

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// Staff Management API calls
export async function fetchAllStaff() {
  const res = await fetch(`${API_BASE_URL}/api/staff`);
  if (!res.ok) throw new Error('Failed to fetch staff');
  return res.json();
}

export async function fetchStaffById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/staff/${id}`);
  if (!res.ok) throw new Error('Failed to fetch staff member');
  return res.json();
}

export async function createStaff(staffData: any) {
  const res = await fetch(`${API_BASE_URL}/api/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData)
  });
  if (!res.ok) throw new Error('Failed to create staff member');
  return res.json();
}

export async function updateStaff(id: string, staffData: any) {
  const res = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(staffData)
  });
  if (!res.ok) throw new Error('Failed to update staff member');
  return res.json();
}

export async function deleteStaff(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/staff/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete staff member');
  return res.json();
}

// Leave Request API calls
export async function fetchAllLeaveRequests() {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests`);
  if (!res.ok) throw new Error('Failed to fetch leave requests');
  return res.json();
}

export async function fetchLeaveRequestById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests/${id}`);
  if (!res.ok) throw new Error('Failed to fetch leave request');
  return res.json();
}

export async function createLeaveRequest(leaveData: any) {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData)
  });
  if (!res.ok) throw new Error('Failed to create leave request');
  return res.json();
}

export async function updateLeaveRequest(id: string, leaveData: any) {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leaveData)
  });
  if (!res.ok) throw new Error('Failed to update leave request');
  return res.json();
}

export async function deleteLeaveRequest(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete leave request');
  return res.json();
}

export async function updateLeaveRequestStatus(id: string, status: string) {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update leave request status');
  return res.json();
}

export async function fetchPendingLeaveRequestCount() {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests/pending/count`);
  if (!res.ok) throw new Error('Failed to fetch pending leave request count');
  return res.json();
}

export async function fetchLeaveRequestsByStaff(staffId: string) {
  const res = await fetch(`${API_BASE_URL}/api/leaverequests/staff/${staffId}`);
  if (!res.ok) throw new Error('Failed to fetch leave requests by staff');
  return res.json();
}

// Payment API calls
export async function fetchAllPayments() {
  const res = await fetch(`${API_BASE_URL}/api/payments`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

export async function fetchPaymentById(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/payments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch payment');
  return res.json();
}

export async function createPayment(paymentData: any) {
  const res = await fetch(`${API_BASE_URL}/api/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
}

export async function updatePayment(id: string, paymentData: any) {
  const res = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  if (!res.ok) throw new Error('Failed to update payment');
  return res.json();
}

export async function deletePayment(id: string) {
  const res = await fetch(`${API_BASE_URL}/api/payments/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete payment');
  return res.json();
}
