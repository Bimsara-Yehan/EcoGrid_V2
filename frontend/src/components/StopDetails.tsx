import React from "react";
import type { Stop } from "./StopCard";
import { openGoogleMapsDirections } from "../lib/maps";

export default function StopDetails({
  stop,
  onClose
}: {
  stop: Stop | null;
  onClose: () => void;
}) {
  if (!stop) return null;
  return (
    <div role="dialog" aria-label="Stop details"
         className="fixed inset-0 bg-black/20 flex items-end md:items-center md:justify-center z-50">
      <div className="bg-white w-full md:w-[520px] rounded-t-2xl md:rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Stop Details</h2>
          <button onClick={onClose} className="px-3 py-2 rounded-lg hover:bg-slate-100" style={{ minHeight: 44 }}>
            Close
          </button>
        </div>

        <div className="mt-2 text-sm text-slate-700">
          <div className="font-semibold">{stop.title}</div>
          {stop.subtitle && <div className="text-slate-500">{stop.subtitle}</div>}
          {typeof stop.fill === "number" && <div className="mt-1">Bin fill ~{stop.fill}%</div>}
          <div className="mt-1">Coords: {stop.coords[0].toFixed(4)}, {stop.coords[1].toFixed(4)}</div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <span className="text-xs text-slate-500 col-span-3">Update status</span>
          <button className="rounded-xl px-3 py-3 text-white font-semibold" style={{ backgroundColor: "var(--success)", minHeight: 48 }}>Collected</button>
          <button className="rounded-xl px-3 py-3 text-white font-semibold" style={{ backgroundColor: "var(--danger)", minHeight: 48 }}>Missed</button>
          <button className="rounded-xl px-3 py-3 font-semibold bg-yellow-100" style={{ minHeight: 48 }}>Skipped</button>
        </div>
      </div>
    </div>
  );
}
