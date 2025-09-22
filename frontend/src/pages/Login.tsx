import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login, storeToken } from "../services/auth";
import { ecogridLogin, setEcoGridToken } from "../services/ecogrid";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [passwordErr, setPasswordErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  function validateEmail(value: string): string | null {
    if (!value) return "Email is required";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value) ? null : "Enter a valid email address";
  }

  function validatePassword(value: string): string | null {
    if (!value) return "Password is required";
    if (value.length < 6) return "Minimum 6 characters";
    if (!/[^A-Za-z0-9]/.test(value)) return "Must include at least one symbol";
    return null;
  }

  const isFormValid = !validateEmail(email) && !validatePassword(password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Final validation gate
    setEmailTouched(true);
    setPasswordTouched(true);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailErr(eErr);
    setPasswordErr(pErr);
    if (eErr || pErr || loading) return;

    setLoading(true); setError(null);
    try {
      const res = await login(email.trim(), password);
      storeToken(res.token);
      // Fire-and-forget EcoGrid login; does not block redirect
      ecogridLogin(email.trim(), password)
        .then((ecoToken) => setEcoGridToken(ecoToken))
        .catch(() => { /* ignore for demo; ensure same user exists in EcoGrid DB */ });
      const roles = res.user.roles || [];
      const has = (r: string) => roles.includes(r);
      // Redirect priority: scheduler > driver > EcoGrid customer fallback
      if (has("scheduler")) navigate("/scheduler", { replace: true });
      else if (has("driver")) navigate("/driver", { replace: true });
      else navigate("/ecogrid/customer", { replace: true });
    } catch (e: any) {
      setError(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form noValidate onSubmit={onSubmit} style={{ width: 360, padding: 24, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
        <h1 style={{ marginBottom: 16 }}>Sign in</h1>
        <label>Email</label>
        <input
          value={email}
          onChange={e => {
            const v = e.target.value;
            setEmail(v);
            if (emailTouched) setEmailErr(validateEmail(v));
          }}
          onBlur={() => { setEmailTouched(true); setEmailErr(validateEmail(email)); }}
          type="email"
          required
          aria-invalid={emailErr ? true : false}
          aria-describedby={emailErr ? "email-error" : undefined}
          style={{ width: "100%", padding: 8, margin: "4px 0 6px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        />
        {emailErr && (
          <div id="email-error" style={{ color: "#b91c1c", margin: "0 0 12px" , fontSize: 12 }}>{emailErr}</div>
        )}
        <label>Password</label>
        <input
          value={password}
          onChange={e => {
            const v = e.target.value;
            setPassword(v);
            if (passwordTouched) setPasswordErr(validatePassword(v));
          }}
          onBlur={() => { setPasswordTouched(true); setPasswordErr(validatePassword(password)); }}
          type="password"
          required
          aria-invalid={passwordErr ? true : false}
          aria-describedby={passwordErr ? "password-error" : undefined}
          style={{ width: "100%", padding: 8, margin: "4px 0 6px", border: "1px solid #cbd5e1", borderRadius: 6 }}
        />
        {passwordErr && (
          <div id="password-error" style={{ color: "#b91c1c", margin: "0 0 12px", fontSize: 12 }}>{passwordErr}</div>
        )}
        {error && <div style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</div>}
        <button disabled={loading || !isFormValid} type="submit" style={{ width: "100%", padding: 10, border: 0, borderRadius: 6, background: loading || !isFormValid ? "#86efac" : "#16a34a", color: "#fff" }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}


