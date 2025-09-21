import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import "./styles/main.css";

import DriverDashboard from "./pages/DriverDashboard";
import RoutePage from "./pages/Route";
import DropOffLogPage from "./pages/DropOffLog";
import DailyReport from "./pages/DailyReport";
import { ToastProvider } from "./components/Toast";
import Scheduler from "./pages/Scheduler";
import LoginPage from "./pages/Login";
import { getToken } from "./services/auth";

function RequireAuth({ children, requireRole }: { children: React.ReactElement, requireRole?: string }) {
  const token = getToken();
  const location = useLocation();
  const requireLogin = import.meta.env.VITE_REQUIRE_LOGIN !== "0"; // enforce when set, even in dev
  if (!token && requireLogin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (requireRole) {
    try {
      const payload = JSON.parse(atob((token || "").split(".")[1] || "{}"));
      const roles: string[] = payload?.roles || [];
      if (!roles.includes(requireRole)) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    } catch {}
  }
  return children;
}

function App() {
  const ENABLE_SCHEDULER = import.meta.env.VITE_ENABLE_SCHEDULER === "1";
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/driver" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/driver" element={<RequireAuth requireRole="driver"><DriverDashboard /></RequireAuth>} />
          <Route path="/route" element={<RequireAuth requireRole="driver"><RoutePage /></RequireAuth>} />
          <Route path="/dropoff" element={<RequireAuth requireRole="driver"><DropOffLogPage /></RequireAuth>} />
          <Route path="/report" element={<RequireAuth requireRole="driver"><DailyReport /></RequireAuth>} />
          {ENABLE_SCHEDULER && <Route path="/scheduler" element={<RequireAuth requireRole="scheduler"><Scheduler /></RequireAuth>} />}
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
