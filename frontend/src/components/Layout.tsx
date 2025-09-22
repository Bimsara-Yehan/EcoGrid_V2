import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function QuickStartRouteButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"    
      onClick={() => navigate("/route")}
      className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl bg-green-50 text-green-800 font-semibold hover:bg-green-100"
      style={{ minHeight: 48 }}
    >
      ▶️ Start Route
    </button>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onDashboard = pathname === "/driver";

  // add this just inside your Layout function
const titles: Record<string, string> = {
  "/driver": "Driver Dashboard",
  "/route": "Route (Map & List)",
  "/dropoff": "Drop-Off Log",
  "/report": "Daily Report",
};
const pageTitle = titles[pathname] ?? "EcoGrid";


  return (
    <div className="min-h-dvh grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="bg-white border-r border-slate-200 p-3 lg:sticky lg:top-0 lg:h-dvh" aria-label="Main navigation">
        {/* Brand → link to dashboard */}
        <NavLink to="/driver" className="flex items-center gap-2 px-2 py-3 rounded-lg hover:bg-slate-50">
          <img src="/Eco.png" alt="EcoGrid" className="h-6 w-auto object-contain" />
        </NavLink>

        <nav className="mt-2 space-y-1" role="navigation">
          {/* NEW: explicit Dashboard link */}
          <NavLink
            to="/driver"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl font-medium ${isActive ? "bg-green-100 text-green-900" : "hover:bg-slate-50"}`
            }
            style={{ minHeight: 48 }}
          >
            🏠 Driver Dashboard
          </NavLink>

          <NavLink
            to="/route"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl font-medium ${isActive ? "bg-green-100 text-green-900" : "hover:bg-slate-50"}`
            }
            style={{ minHeight: 48 }}
          >
            🗺️ Route (Map & List)
          </NavLink>

          <NavLink
            to="/report"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl font-medium ${isActive ? "bg-green-100 text-green-900" : "hover:bg-slate-50"}`
            }
            style={{ minHeight: 48 }}
          >
            📄 Daily Report
          </NavLink>

          <NavLink
            to="/dropoff"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl font-medium ${isActive ? "bg-green-100 text-green-900" : "hover:bg-slate-50"}`
            }
            style={{ minHeight: 48 }}
          >
            🗑️ Drop-Off Log
          </NavLink>

          <div className="pt-4 mt-4 border-t border-slate-200 text-xs text-slate-500">
            Quick Actions
          </div>
          <QuickStartRouteButton />
        </nav>
      </aside>

      {/* Main area */}
      <div className="flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between" role="banner">
          <div className="flex items-center gap-2">
            {/* NEW: Back to Dashboard (hidden on dashboard) */}
            {!onDashboard && (
              <button
                onClick={() => navigate("/driver")}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium"
                style={{ minHeight: 40 }}
                aria-label="Back to Driver Dashboard"
              >
                ← Back to Dashboard
              </button>
            )}
            <div className="font-semibold">{pageTitle}</div>

          </div>

          <div className="flex items-center gap-3">
            {/* SOS: always visible */}
            <button
              className="px-3 py-2 rounded-xl text-white font-semibold"
              style={{ backgroundColor: "var(--danger)", minHeight: 44 }}
              aria-label="SOS / Call dispatcher"
              onClick={() => alert("SOS sent to dispatcher")}
            >
              SOS
            </button>

            {/* Online pill */}
            <span className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-full bg-green-50 text-green-700" style={{ minHeight: 44 }}>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" aria-hidden></span>
              Online
            </span>

            {/* Driver avatar */}
            <button className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-50" aria-label="Open driver menu" style={{ minHeight: 44 }}>
              <img src="https://api.dicebear.com/9.x/identicon/svg?seed=driver" alt="Driver profile" className="w-8 h-8 rounded-full" />
              <span className="hidden sm:inline font-medium">Driver</span>
            </button>
          </div>
        </header>

        <main className="p-4" role="main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
