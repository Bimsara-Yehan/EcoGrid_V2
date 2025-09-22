import { Link, Outlet, useNavigate } from 'react-router-dom'
import './App.css'

function App() {
  const navigate = useNavigate()
  return (
    <div>
      <div className="header">
        <div className="brand">EcoGrid</div>
        <div className="nav" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/zones">Zones</Link>
          <Link to="/subscriptions">Subscriptions</Link>
          <Link to="/map">Map</Link>
          <button
            onClick={() => { localStorage.removeItem('waste_token'); localStorage.removeItem('waste_role'); navigate('/login', { replace: true }); }}
            style={{ marginLeft: 8, padding: '6px 10px', borderRadius: 6, border: '1px solid #334155', background: '#0b1220', color: '#e5e7eb', cursor: 'pointer' }}
            title="Logout"
          >Logout</button>
        </div>
      </div>
      <Outlet />
    </div>
  )
}

// Layout without navigation for update pages
function UpdateLayout() {
  return (
    <div>
      <div className="header">
        <div className="brand">EcoGrid</div>
      </div>
      <Outlet />
    </div>
  )
}

export { UpdateLayout }
export default App
