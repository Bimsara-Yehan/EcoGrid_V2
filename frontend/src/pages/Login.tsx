import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, storeToken } from "../services/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await login(email.trim(), password);
      storeToken(res.token);
      const roles = res.user.roles || [];
      const has = (r: string) => roles.includes(r);
      // Redirect priority: scheduler > driver > fallback
      if (has("scheduler")) navigate("/scheduler", { replace: true });
      else if (has("driver")) navigate("/driver", { replace: true });
      else navigate((location.state as any)?.from || "/", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={onSubmit} style={{ width: 360, padding: 24, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
        <h1 style={{ marginBottom: 16 }}>Sign in</h1>
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required style={{ width: "100%", padding: 8, margin: "4px 0 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
        <label>Password</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required style={{ width: "100%", padding: 8, margin: "4px 0 12px", border: "1px solid #cbd5e1", borderRadius: 6 }} />
        {error && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ width: "100%", padding: 10, border: 0, borderRadius: 6, background: "#16a34a", color: "#fff" }}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  );
}


