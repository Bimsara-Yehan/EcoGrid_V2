import React from "react";

export default function AlertBanner(
  { text, onClick }: { text: string; onClick?: () => void }
) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-yellow-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:bg-yellow-50"
      style={{ minHeight: 48 }}
      aria-label={text}
    >
      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--warn)' }} aria-hidden />
      <span className="font-medium">{text}</span>
    </button>
  );
}
