export const ECOGRID_BASE = import.meta.env.VITE_ECOGRID_BASE ?? "http://localhost:5001";

export async function ecogridLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${ECOGRID_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`EcoGrid login failed: ${res.status}`);
  const data = await res.json();
  return data?.token as string;
}

export function setEcoGridToken(token: string | null) {
  if (token) localStorage.setItem("ecogrid_token", token);
  else localStorage.removeItem("ecogrid_token");
}

export function getEcoGridToken(): string | null {
  return localStorage.getItem("ecogrid_token");
}



