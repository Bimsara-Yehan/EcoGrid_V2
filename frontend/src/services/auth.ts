import { API_BASE } from "../lib/env";

export type LoginResponse = { token: string; user: { id: string; email: string; roles: string[] } };

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}

export function storeToken(token: string) {
  localStorage.setItem("auth_token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function logout() {
  localStorage.removeItem("auth_token");
}




