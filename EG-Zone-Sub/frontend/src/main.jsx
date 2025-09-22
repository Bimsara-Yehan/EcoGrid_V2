import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'
import App, { UpdateLayout } from './App.jsx'
import './index.css'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw/dist/leaflet.draw.css'
import ZonesPage from './pages/ZonesPage.jsx'
import UpdateZonePage from './pages/UpdateZonePage.jsx'
import SubsPage from './pages/SubsPage.jsx'
import UpdateSubscriptionPage from './pages/UpdateSubscriptionPage.jsx'
import MapView from './pages/MapView.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Login from './components/Login.jsx'

function RequireWasteAuth({ children }) {
  const token = localStorage.getItem('waste_token')
  const location = useLocation()
  if (!token) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />}> 
          <Route index element={<Navigate to="/zones" replace />} />
          <Route path="zones" element={<RequireWasteAuth><ZonesPage /></RequireWasteAuth>} />
          <Route path="subscriptions" element={<RequireWasteAuth><SubsPage /></RequireWasteAuth>} />
          <Route path="map" element={<RequireWasteAuth><MapView /></RequireWasteAuth>} />
          <Route path="dashboard" element={<RequireWasteAuth><Dashboard /></RequireWasteAuth>} />
        </Route>
        
        {/* Update pages with no navigation tabs */}
        <Route path="/" element={<UpdateLayout />}>
          <Route path="zones/edit/:id" element={<UpdateZonePage />} />
          <Route path="subscriptions/edit/:id" element={<UpdateSubscriptionPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
