import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
};

export default function PhotoCapture({ open, onClose, onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
        document.body.classList.add("overflow-hidden"); // prevent scroll behind
      } catch (e) {
        console.error(e);
        onClose();
      }
    })();
    return () => {
      document.body.classList.remove("overflow-hidden");
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const content = (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      {/* dialog */}
      <div className="relative z-[5001] bg-white rounded-2xl shadow-xl w-[min(92vw,960px)]">
        <div className="p-3">
          <video ref={videoRef} className="w-full rounded-xl bg-black" playsInline muted />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className="px-4 py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: "var(--primary)" }}
              onClick={() => {
                const video = videoRef.current;
                if (!video) return;
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext("2d");
                if (!ctx) return;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((b) => b && onCapture(b), "image/jpeg", 0.92);
              }}
            >
              Capture
            </button>
            <button className="px-4 py-3 rounded-xl bg-slate-100 font-semibold" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 🔥 Render above everything else
  return createPortal(content, document.body);
}
