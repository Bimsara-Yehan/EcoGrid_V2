import React, { useState } from "react";
import PhotoCapture from "./PhotoCapture";
import ReasonModal from "./ReasonModal";
import { useToast } from "./Toast";
import { openGoogleMapsDirections } from "../lib/maps";
import { createPickup } from "../services/pickups";

export type Stop = {
  id: string;
  kind: "household" | "bin";
  title: string;
  subtitle?: string;
  coords: [number, number];
  fill?: number;
  status?: "assigned" | "collected" | "missed" | "skipped";
};

export default function StopCard({
  stop,
  onSelect,
  onAfterAction,
}: {
  stop: Stop;
  onSelect: (id: string) => void;
  onAfterAction?: (id: string, action: "collected"|"missed"|"skipped") => void;
}) {
  const toast = useToast();
  const [camOpen, setCamOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState<false | "missed" | "skipped">(false);
  const [pendingAction, setPendingAction] = useState<null | "collected" | "missed" | "skipped">(null);
  const [localStatus, setLocalStatus] = useState<"assigned"|"collected"|"missed"|"skipped">(stop.status || "assigned");

  async function getGPS() {
    return new Promise<{lat?: number; lng?: number}>(resolve => {
      if (!navigator.geolocation) return resolve({});
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({}),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  // === Collected: take photo then submit
  function handleCollected() { setCamOpen(true); }

  async function submitCollected(photoDataUrl: string) {
    try {
      setPendingAction("collected");
      const { lat, lng } = await getGPS();
      await createPickup({ stopId: stop.id, action: "collected", photoUrl: photoDataUrl, lat, lng });
      toast.push("Marked collected");
      setLocalStatus("collected");
      onAfterAction && onAfterAction(stop.id, "collected");
    } catch (e) {
      console.error(e);
      toast.push("Failed to submit (collected)");
    } finally {
      setPendingAction(null);
    }
  }

  function onCapture(blob: Blob) {
    const r = new FileReader();
    r.onloadend = () => {
      submitCollected(String(r.result)).finally(() => setCamOpen(false));
    };
    r.readAsDataURL(blob);
  }

  // === Missed/Skipped: collect reason then submit
  function handleMissed()  { setReasonOpen("missed"); }
  function handleSkipped() { setReasonOpen("skipped"); }

  async function submitWithReason(action: "missed"|"skipped", reason: string) {
    try {
      const trimmed = (reason || "").trim();
      if (trimmed.length < 3) {
        toast.push("Reason is required (min 3 characters)");
        return;
      }
      setPendingAction(action);
      const { lat, lng } = await getGPS();
      await createPickup({ stopId: stop.id, action, reason: trimmed, lat, lng });
      toast.push(`Marked ${action}`);
      setLocalStatus(action);
      onAfterAction && onAfterAction(stop.id, action);
    } catch (e) {
      console.error(e);
      toast.push(`Failed to submit (${action})`);
    } finally {
      setPendingAction(null);
      setReasonOpen(false);
    }
  }

  return (
    <article className="bg-white rounded-2xl shadow-sm p-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-semibold">{stop.title}</div>
          {stop.subtitle && <div className="text-sm text-slate-500">{stop.subtitle}</div>}
          {stop.kind === "bin" && typeof stop.fill === "number" && (
            <div className="text-xs text-slate-500 mt-1">Fill ~{stop.fill}%</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${stop.kind === "bin" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-700"}`}>
            {stop.kind === "bin" ? "BIN" : "HOUSE"}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${localStatus === "collected" ? "bg-green-100 text-green-700" : localStatus === "missed" ? "bg-red-100 text-red-700" : localStatus === "skipped" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-700"}`}>
            {localStatus.charAt(0).toUpperCase() + localStatus.slice(1)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button disabled={pendingAction !== null} onClick={handleCollected}
          className="w-full rounded-xl px-3 py-3 text-white font-semibold whitespace-nowrap"
          style={{ backgroundColor: "var(--success)", minHeight: 48 }}>
          {pendingAction === "collected" ? "⏳ Collecting…" : "Collected"}
        </button>
        <button disabled={pendingAction !== null} onClick={handleMissed}
          className="w-full rounded-xl px-3 py-3 text-white font-semibold whitespace-nowrap"
          style={{ backgroundColor: "var(--danger)", minHeight: 48 }}>
          {pendingAction === "missed" ? "⏳ Marking…" : "Missed"}
        </button>
        <button disabled={pendingAction !== null} onClick={handleSkipped}
          className="w-full rounded-xl px-3 py-3 font-semibold bg-yellow-100 whitespace-nowrap"
          style={{ minHeight: 48 }}>
          {pendingAction === "skipped" ? "⏳ Skipping…" : "Skipped"}
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={() => openGoogleMapsDirections(stop.coords[0], stop.coords[1], stop.title)}
          className="rounded-xl px-3 py-3 font-semibold bg-green-50 hover:bg-green-100"
          style={{ minHeight: 44 }}>
          🧭 Navigate
        </button>
        <button onClick={() => onSelect(stop.id)} className="rounded-xl px-3 py-3 font-semibold hover:bg-slate-50" style={{ minHeight: 44 }}>
          View details
        </button>
      </div>

      {/* Modals */}
      <PhotoCapture open={camOpen} onClose={() => setCamOpen(false)} onCapture={onCapture} />
      <ReasonModal
        open={Boolean(reasonOpen)}
        title={reasonOpen ? `Reason for ${reasonOpen}` : "Reason"}
        onClose={() => setReasonOpen(false)}
        onSubmit={(r) => reasonOpen && submitWithReason(reasonOpen, r)}
      />
    </article>
  );
}
