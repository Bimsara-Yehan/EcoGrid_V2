// frontend/src/components/ReasonModal.tsx
import React, { useState } from "react";

export default function ReasonModal({
  open, onClose, onSubmit, title = "Reason"
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  title?: string;
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl w-[min(520px,92vw)] p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <textarea
          className="mt-3 w-full rounded-xl border p-3"
          rows={4}
          placeholder="e.g., Bin inaccessible / resident not home"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100">Cancel</button>
          <button
            onClick={() => { onSubmit(reason.trim()); setReason(""); }}
            className="px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: "var(--primary)" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
