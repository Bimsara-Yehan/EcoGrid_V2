// frontend/src/services/reports.ts
import { API_BASE } from "../lib/env";
import { getToken } from "./auth";

export type ReportActivity = {
  id: string;
  action: "collected" | "missed" | "skipped";
  createdAt: string;
  stopId: string;
  stopTitle: string;
  reason?: string | null;
};

export type DailyReportDTO = {
  date: string;
  totals: { assigned: number; collected: number; missed: number; skipped: number };
  activity: ReportActivity[];
  dropoffs: {
    time?: string;
    facility?: string;
    weightKg?: number;
    notes?: string;
  }[];
  dropoffTotals: { count: number; weightKg: number };
};

export async function fetchDailyReport(date: string): Promise<DailyReportDTO> {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/reports/daily?date=${date}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

export async function downloadDailyReportPdf(date: string) {
  const token = getToken();
  const r = await fetch(`${API_BASE}/api/reports/daily.pdf?date=${date}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `EcoGrid_Daily_${date}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
