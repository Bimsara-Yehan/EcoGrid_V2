import { Link, Outlet } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div>
      <div className="header">
        <div className="brand">EcoGrid</div>
        <div className="nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/zones">Zones</Link>
          <Link to="/subscriptions">Subscriptions</Link>
          <Link to="/map">Map</Link>
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
