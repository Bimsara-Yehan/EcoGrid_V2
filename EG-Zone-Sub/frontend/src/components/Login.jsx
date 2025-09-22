import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem('waste_token', '1');
      localStorage.setItem('waste_role', 'zones_manager');
      navigate('/dashboard', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <form onSubmit={onSubmit} style={{ width: 360, padding: 24, border: '1px solid #334155', borderRadius: 8, background: '#111827', color: '#e5e7eb' }}>
        <h1 style={{ marginBottom: 16, fontSize: 20 }}>Waste Login</h1>
        <label style={{ fontSize: 12 }}>Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          style={{ width: '100%', padding: 8, margin: '4px 0 12px', border: '1px solid #475569', borderRadius: 6, background: '#0b1220', color: '#e5e7eb' }}
        />
        <label style={{ fontSize: 12 }}>Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          style={{ width: '100%', padding: 8, margin: '4px 0 12px', border: '1px solid #475569', borderRadius: 6, background: '#0b1220', color: '#e5e7eb' }}
        />
        <button disabled={loading} type="submit" style={{ width: '100%', padding: 10, border: 0, borderRadius: 6, background: '#22c55e', color: '#0b1220', fontWeight: 600 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}


