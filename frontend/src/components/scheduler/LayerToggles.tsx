import React from "react";

type Props = {
  state: { customers: boolean; bins: boolean; incidents: boolean; facilities: boolean; depots: boolean; numbers: boolean };
  onChange: (next: Props["state"]) => void;
};

export default function LayerToggles({ state, onChange }: Props) {
  function toggle(key: keyof Props["state"]) {
    onChange({ ...state, [key]: !state[key] });
  }
  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries({ customers: "Customers", bins: "Bins", incidents: "Incidents", facilities: "Facilities", depots: "Depots", numbers: "Sequence #" }).map(([k, label]) => (
        <button
          key={k}
          onClick={() => toggle(k as keyof Props["state"])}
          className={`px-3 py-1.5 rounded-full text-sm border ${state[k as keyof Props["state"]] ? "bg-green-100 border-green-300 text-green-900" : "bg-white border-slate-300 text-slate-700"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}



