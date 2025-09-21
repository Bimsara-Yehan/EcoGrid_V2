import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}> 
          <Route index element={<Navigate to="/zones" replace />} />
          <Route path="zones" element={<ZonesPage />} />
          <Route path="subscriptions" element={<SubsPage />} />
          <Route path="map" element={<MapView />} />
          <Route path="dashboard" element={<Dashboard />} />
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
