import React, { useEffect, useState } from "react";
import { ECOGRID_BASE, getEcoGridToken } from "../services/ecogrid";

type EcoUser = {
  email?: string;
  name?: string;
  profileImageUrl?: string | null;
  hasCompletedOnboarding?: boolean;
  phones?: string[];
  addresses?: any[];
};

type UpcomingCollection = {
  _id: string;
  wasteType?: string;
  scheduledDate?: string;
  status?: string;
};

type RecyclingTip = {
  _id: string;
  title?: string;
  description?: string;
};

export default function EcoGridCustomer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<EcoUser | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingCollection[]>([]);
  const [tips, setTips] = useState<RecyclingTip[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const token = getEcoGridToken();
        if (!token) {
          setError("EcoGrid token missing. Ensure EcoGrid is running and the account exists in the shared DB.");
          setLoading(false);
          return;
        }
        // Profile (auth)
        const res = await fetch(`${ECOGRID_BASE}/api/auth/me`, {
          headers: { "x-auth-token": token }
        });
        if (!res.ok) {
          setError(`EcoGrid profile failed: HTTP ${res.status}`);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setUser(data);

        // Upcoming collections (auth)
        const up = await fetch(`${ECOGRID_BASE}/api/waste-collection/upcoming`, {
          headers: { "x-auth-token": token }
        });
        if (up.ok) {
          const u = await up.json();
          setUpcoming(Array.isArray(u) ? u : []);
        }

        // Recycling tips (public)
        const tipsRes = await fetch(`${ECOGRID_BASE}/api/recycling-guide/tips?language=en`);
        if (tipsRes.ok) {
          const t = await tipsRes.json();
          setTips(Array.isArray(t) ? t.slice(0, 5) : []);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load EcoGrid profile");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>EcoGrid Customer</h1>
      {loading && <div>Loading customer profile…</div>}
      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}
      {!loading && !error && (
        <>
          {user && (
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
              {user.profileImageUrl && (
                <img src={user.profileImageUrl} alt="profile" style={{ width: 64, height: 64, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb" }} />
              )}
              <div>
                <div style={{ fontWeight: 600 }}>{user.name || "Customer"}</div>
                <div style={{ color: "#475569" }}>{user.email}</div>
                <div style={{ marginTop: 8 }}>
                  Onboarding: {user.hasCompletedOnboarding ? "Completed" : "Pending"}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <h2 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Upcoming Collections</h2>
            {upcoming.length === 0 ? (
              <div style={{ color: "#475569" }}>No upcoming collections.</div>
            ) : (
              <ul style={{ paddingLeft: 16 }}>
                {upcoming.slice(0, 5).map((c) => (
                  <li key={c._id} style={{ marginBottom: 6 }}>
                    {c.scheduledDate ? new Date(c.scheduledDate).toLocaleString() : ""} — {c.wasteType || "Collection"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <h2 style={{ marginBottom: 8, fontSize: 16, fontWeight: 600 }}>Recycling Tips</h2>
            {tips.length === 0 ? (
              <div style={{ color: "#475569" }}>No tips available.</div>
            ) : (
              <ul style={{ paddingLeft: 16 }}>
                {tips.map((t) => (
                  <li key={t._id} style={{ marginBottom: 6 }}>
                    <strong>{t.title || "Tip"}:</strong> {t.description || ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}


