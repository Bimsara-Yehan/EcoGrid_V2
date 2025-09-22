import React from "react";

type DriverSummary = { id: string; name: string; stops: number };

type Props = {
  open: boolean;
  date: string;
  drivers: DriverSummary[];
  onConfirm: () => void;
  onClose: () => void;
  errors?: string[];
  confirmDisabled?: boolean;
};

export default function ConfirmModal({ open, date, drivers, onConfirm, onClose, errors = [], confirmDisabled = false }: Props) {
  if (!open) return null;
  const totalStops = drivers.reduce((n, d) => n + d.stops, 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-lg p-4">
        <div className="font-semibold text-lg mb-2">Publish plan</div>
        <div className="text-sm text-slate-700 mb-3">
          You are about to publish routes for <strong>{drivers.length}</strong> driver(s) on <strong>{date}</strong>.
          This will replace all <em>unstarted</em> stops for each driver on that date. Started or completed stops will remain.
        </div>
        {errors.length > 0 && (
          <div className="mb-3 rounded-lg border px-3 py-2" style={{ borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
            <div className="text-sm font-medium mb-1">Please fix before publishing:</div>
            <ul className="list-disc pl-5 text-sm">
              {errors.map((e, i) => (<li key={i}>{e}</li>))}
            </ul>
          </div>
        )}
        <div className="max-h-48 overflow-auto border rounded-xl mb-3">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-3 py-2">Driver</th>
                <th className="text-right px-3 py-2">Stops</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id} className="border-t">
                  <td className="px-3 py-2">{d.name}</td>
                  <td className="px-3 py-2 text-right">{d.stops}</td>
                </tr>
              ))}
              <tr className="border-t font-medium">
                <td className="px-3 py-2">Total</td>
                <td className="px-3 py-2 text-right">{totalStops}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-xs text-slate-600 mb-3">
          Idempotency: republishing the same plan replaces previous unstarted work for the same driver and date.
        </div>
        <div className="flex items-center justify-end gap-2">
          <button className="px-3 py-2 rounded-lg bg-slate-100" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 rounded-lg text-white font-semibold" onClick={onConfirm} disabled={confirmDisabled}
            style={{ backgroundColor: confirmDisabled ? "#9ca3af" : "#16a34a", cursor: confirmDisabled ? "not-allowed" : "pointer" }}>
            Confirm publish
          </button>
        </div>
      </div>
    </div>
  );
}




