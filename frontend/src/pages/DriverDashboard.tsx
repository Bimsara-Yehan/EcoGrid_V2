import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
 
import Layout from "../components/Layout";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import AlertBanner from "../components/AlertBanner";
import type { Stop } from "../components/StopCard";
import { fetchStops } from "../services/stops";
import { fetchDailyReport, type DailyReport } from "../services/reports";

export default function DriverDashboard() {
  const navigate = useNavigate();

  // Live data
  const [stops, setStops] = useState<Stop[]>([]);
  const [report, setReport] = useState<DailyReport | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Load stops + report for today
 async function load() {
  setLoading(true);
  setErr(null);
  const date = new Date().toISOString().slice(0, 10);

  const [stopsRes, reportRes] = await Promise.allSettled([
    fetchStops(date),
    fetchDailyReport(date)
  ]);

  if (stopsRes.status === "fulfilled") {
    setStops(stopsRes.value);
  } else {
    console.error("Stops error:", stopsRes.reason);
    setStops([]); // or keep previous
    setErr("Stops failed: " + (stopsRes.reason?.message ?? "unknown"));
  }

  if (reportRes.status === "fulfilled") {
    setReport(reportRes.value);
  } else {
    console.warn("Report error:", reportRes.reason);
    // leave report as-is; show badge still OK
  }

  setLoading(false);
}


  useEffect(() => { load(); }, []);

  // Derived numbers for the cards
  const assignedStops = stops.length;
  const completed = report?.totals.collected ?? 0;
  const progressPct = assignedStops ? Math.round((completed / assignedStops) * 100) : 0;
  const highBins = useMemo(
    () => stops.filter(s => typeof s.fill === "number" && s.fill >= 75).length,
    [stops]
  );

  // Choose a "next stop" to display: first not yet collected, or first stop as fallback
  const nextStop = useMemo(() => {
    if (!stops.length) return null;
    // If you want smarter logic later, you can cross-check report.items to exclude completed stops
    return stops[0];
  }, [stops]);

  return (
    <Layout>
      {/* Top inline status */}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 font-medium">
          {assignedStops} stops loaded
        </span>
        {loading && <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">Loading…</span>}
        {err && (
          <span className="px-2 py-1 rounded-full bg-red-50 text-red-700">
            API error: {err}
          </span>
        )}
        
      </div>

      {/* IoT Alerts */}
      <div className="grid gap-3">
        <AlertBanner
          text={`⚠️ ${highBins} bins at 75%+ fullness — prioritize these first`}
          onClick={() => navigate("/route")}
        />
      </div>

      {/* Tabs (visual only for now) */}
      <nav className="mt-3 bg-white rounded-2xl shadow-sm p-1 flex gap-1" role="tablist" aria-label="View">
        <button
          type="button"
          role="tab"
          aria-selected="true"
          className="flex-1 rounded-xl px-4 py-3 font-semibold text-white"
          style={{ backgroundColor: "var(--primary)", minHeight: 44 }}
          onClick={() => navigate("/route")}
        >
          Map
        </button>
        <button
          type="button"
          role="tab"
          aria-selected="false"
          className="flex-1 rounded-xl px-4 py-3 font-semibold text-slate-800"
          style={{ minHeight: 44 }}
          onClick={() => navigate("/route")}
        >
          List
        </button>
      </nav>

      {/* KPI row */}
      <section className="mt-4 grid gap-3 md:grid-cols-3">
        <StatCard label="Assigned stops" value={assignedStops} />
        <StatCard label="Completed" value={completed} hint={`${progressPct}% today`} />
        <StatCard label="Bins ≥75%" value={highBins} />
      </section>

      {/* Route progress + next stop */}
      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <article className="bg-white rounded-2xl shadow-sm p-4 lg:col-span-2">
          <h2 className="text-base font-semibold mb-3">Route Progress</h2>
          <ProgressBar value={progressPct} />
          <div className="mt-2 text-sm text-slate-600">
            {completed} of {assignedStops} stops completed
          </div>
        </article>

        <article className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="text-base font-semibold mb-2">Next Stop</h2>
          {nextStop ? (
            <>
              <p className="text-slate-600 text-sm">
                {nextStop.title} {nextStop.subtitle ? `• ${nextStop.subtitle}` : ""}
              </p>
              {typeof nextStop.fill === "number" && (
                <p className="text-slate-600 text-sm mt-1">Fill ~{nextStop.fill}%</p>
              )}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded-xl px-3 py-3 text-white font-semibold"
                  style={{ backgroundColor: "var(--success)", minHeight: 48 }}
                  onClick={() => navigate("/route")}
                >
                  Mark Collected
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl px-3 py-3 text-white font-semibold"
                  style={{ backgroundColor: "var(--danger)", minHeight: 48 }}
                  onClick={() => navigate("/route")}
                >
                  Mark Missed
                </button>
              </div>
            </>
          ) : (
            <p className="text-slate-600 text-sm">No assigned stops today.</p>
          )}
        </article>
      </section>

      {/* Big CTAs */}
      <div className="mt-6 bg-white rounded-2xl shadow-md p-3 flex gap-2">
        <button
          type="button"
          onClick={() => navigate("/route")}
          className="flex-1 rounded-xl px-4 py-4 text-white font-semibold"
          style={{ backgroundColor: "var(--primary)", minHeight: 48 }}
        >
          Start Route
        </button>
        <button
          type="button"
          onClick={() => navigate("/dropoff")}
          className="flex-1 rounded-xl px-4 py-4 font-semibold"
          style={{ backgroundColor: "var(--accent)", color: "#111827", minHeight: 48 }}
        >
          Log Drop-Off
        </button>
        <button
          type="button"
          onClick={() => navigate("/report")}
          className="hidden md:block flex-1 rounded-xl px-4 py-4 font-semibold bg-white border"
          style={{ minHeight: 48 }}
        >
          View Daily Report
        </button>
      </div>
    </Layout>
  );
}
