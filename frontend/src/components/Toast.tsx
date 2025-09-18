import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";  


type ToastMsg = { id: string; text: string };
const ToastCtx = createContext<{ push: (text: string) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastMsg[]>([]);
  function push(text: string) {
    const id = String(Date.now() + Math.random());
    setItems(prev => [...prev, { id, text }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 2500);
  }
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] grid gap-2">
        {items.map(t => (
          <div key={t.id} className="px-4 py-3 rounded-xl text-white font-semibold shadow"
               style={{ backgroundColor: "var(--primary)" }}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
