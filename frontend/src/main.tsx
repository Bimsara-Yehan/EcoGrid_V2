import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/main.css";

import DriverDashboard from "./pages/DriverDashboard";
import RoutePage from "./pages/Route";
import DropOffLogPage from "./pages/DropOffLog";
import DailyReport from "./pages/DailyReport";
import { ToastProvider } from "./components/Toast";
import Scheduler from "./pages/Scheduler";

function App() {
  const ENABLE_SCHEDULER = import.meta.env.VITE_ENABLE_SCHEDULER === "1";
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/driver" replace />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/route" element={<RoutePage />} />
          <Route path="/dropoff" element={<DropOffLogPage />} />
          <Route path="/report" element={<DailyReport />} />
          {ENABLE_SCHEDULER && <Route path="/scheduler" element={<Scheduler />} />}
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
