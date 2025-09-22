import React from "react";

type Props = {
  title?: string;
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  chips?: React.ReactNode;
  children: React.ReactNode;
};

export default function SchedulerLayout({ title = "Scheduler", toolbarLeft, toolbarRight, chips, children }: Props) {
  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Top toolbar */}
      <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-[1400px] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Eco.png" alt={title} className="h-6 w-auto object-contain" />
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Draft</span>
            {toolbarLeft}
          </div>
          <div className="flex items-center gap-3">{toolbarRight}</div>
        </div>
        {chips && (
          <div className="mx-auto max-w-[1400px] px-4 pb-3">{chips}</div>
        )}
      </header>

      {/* Content area */}
      <main className="mx-auto max-w-[1400px] px-4 py-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">{children}</div>
      </main>
    </div>
  );
}


