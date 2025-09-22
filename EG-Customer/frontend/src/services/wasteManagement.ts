// Service adapter for waste management API calls
// This wraps API calls and reads from environment variables

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Auth services
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function registerUser(userData: any) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}

export async function getCurrentUser(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to get user data');
  return res.json();
}

// Waste collection services
export async function fetchWasteCollections(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/waste-collection`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch waste collections');
  return res.json();
}

export async function createWasteCollection(collectionData: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/waste-collection`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(collectionData)
  });
  if (!res.ok) throw new Error('Failed to create waste collection');
  return res.json();
}

// Recycling guide services
export async function fetchRecyclingGuides(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/recycling-guide`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch recycling guides');
  return res.json();
}

// Reports services
export async function fetchReports(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/reports`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}

export async function createReport(reportData: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/reports`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reportData)
  });
  if (!res.ok) throw new Error('Failed to create report');
  return res.json();
}

// Tasks services
export async function fetchTasks(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/tasks`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
}

export async function updateTask(taskId: string, taskData: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(taskData)
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

// Composting services
export async function fetchCompostingStations(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/composting/stations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch composting stations');
  return res.json();
}

// Chatbot services
export async function sendChatMessage(message: string, sessionId: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/chatbot/message`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ message, sessionId })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function fetchChatHistory(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/chatbot/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch chat history');
  return res.json();
}

// User profile services
export async function fetchUserProfile(token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/user-profile`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfile(profileData: any, token: string) {
  const res = await fetch(`${API_BASE_URL}/api/waste-management/user-profile`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) throw new Error('Failed to update user profile');
  return res.json();
}
