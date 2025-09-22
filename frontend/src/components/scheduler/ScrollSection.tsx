import React from "react";

type Props = {
  title: string;
  count?: number;
  search?: string;
  onSearch?: (s: string) => void;
  maxHeight?: number;
  right?: React.ReactNode;
  children: React.ReactNode;
  anchorRef?: React.RefObject<HTMLDivElement>;
};

export default function ScrollSection({ title, count, search, onSearch, maxHeight = 360, right, children, anchorRef }: Props) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200" ref={anchorRef}>
      <div className="px-4 py-3 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10 flex items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="font-semibold">{title}</div>
          {typeof count === "number" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">{count}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onSearch && (
            <input
              type="text"
              placeholder="Search"
              value={search ?? ""}
              onChange={e => onSearch(e.target.value)}
              className="border rounded-lg px-2 py-1.5 text-sm"
              style={{ minWidth: 140 }}
            />
          )}
          {right}
        </div>
      </div>
      <div className="px-4 py-3" style={{ maxHeight, overflow: "auto" }}>
        {children}
      </div>
    </div>
  );
}


