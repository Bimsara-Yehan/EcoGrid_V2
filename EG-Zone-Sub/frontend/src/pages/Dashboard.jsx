import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip } from 'react-leaflet';
import { getSubscriptionSummary, getZones, getCustomers, getSubscriptions } from '../api';

// Real plans state
// ...existing code...

// Simple SVG charts (no extra deps)
function PieChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  let acc = 0
  const radius = size / 2
  const cx = radius
  const cy = radius
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const start = (acc / total) * Math.PI * 2
        acc += d.value
        const end = (acc / total) * Math.PI * 2
        const x1 = cx + radius * Math.cos(start)
        const y1 = cy + radius * Math.sin(start)
        const x2 = cx + radius * Math.cos(end)
        const y2 = cy + radius * Math.sin(end)
        const large = end - start > Math.PI ? 1 : 0
        const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`
        return <path key={i} d={path} fill={d.color} opacity={0.9} />
      })}
      <circle cx={cx} cy={cy} r={radius - 20} fill="#0f172a" />
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#e2e8f0" style={{ fontSize: 14, fontWeight: 700 }}>Customers</text>
    </svg>
  )
}

function BarChart({ data, height = 140 }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height, gap: 10 }}>
      {data.map(d => (
        <div key={d.label} title={`${d.label}: ${d.value}`} style={{ flex: 1 }}>
          <div style={{ background: d.color, height: `${(d.value / max) * 100}%`, borderRadius: 6 }} />
          <div style={{ marginTop: 6, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

function LineChart({ points }) {
  const width = 320
  const height = 140
  const max = Math.max(...points.map(p => p.y), 1)
  const stepX = width / (points.length - 1)
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${height - (p.y / max) * height}`).join(' ')
  return (
    <svg width={width} height={height}>
      <path d={path} stroke="#60a5fa" fill="none" strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={i * stepX} cy={height - (p.y / max) * height} r={3} fill="#60a5fa" />
      ))}
    </svg>
  )
}

const COLORS = { Urban: '#ef4444', Suburban: '#3b82f6', Rural: '#22c55e', Customers: '#fb923c' }

export default function Dashboard() {
  const [zoneFilter, setZoneFilter] = useState('All')
  const [selectedZone, setSelectedZone] = useState(null)
  const [summary, setSummary] = useState(null)
  const [zonesData, setZonesData] = useState([]) // Fetch full zones for map
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Real customers state
  const [customers, setCustomers] = useState([]);
  // Real plans state
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [summaryData, zones, customersData, plansData] = await Promise.all([
          getSubscriptionSummary(),
          getZones(),
          (typeof getCustomers === 'function' ? getCustomers() : Promise.resolve([])),
          (typeof getSubscriptions === 'function' ? getSubscriptions() : Promise.resolve([]))
        ])
        setSummary(summaryData)
        setZonesData(zones || [])
        setCustomers(customersData || [])
        setPlans(plansData || [])
        setError('')
      } catch (e) {
        setError('Failed to load dashboard data')
        console.error('Dashboard error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])


  // Defensive defaults for summary fields
  const safeSummary = summary || {};
  const customerCountPerZone = safeSummary.customerCountPerZone || [];
  const subCountPerFrequency = safeSummary.subCountPerFrequency || [];
  const revenuePerFrequency = safeSummary.revenuePerFrequency || [];
  const subscriptionGrowth = safeSummary.subscriptionGrowth || [];

  const stats = useMemo(() => {
    // Use zoneTypeCounts from backend summary for correct zone breakdown
    const zoneTypeCountsArr = safeSummary.zoneTypeCounts || [];
    const counts = { Urban: 0, Suburban: 0, Rural: 0 };
    zoneTypeCountsArr.forEach(z => { counts[z._id] = z.count; });

    const totalSubs = subCountPerFrequency.reduce((s, f) => s + f.subCount, 0);
    const totalRevenue = revenuePerFrequency.reduce((s, f) => s + f.totalRevenue, 0);
    const totalCustomers = customerCountPerZone.reduce((s, z) => s + z.customerCount, 0);

    return {
      zones: counts,
      totalZones: safeSummary.totalZones || 0,
      subscriptions: totalSubs,
      revenue: totalRevenue,
      customers: totalCustomers
    };
  }, [safeSummary.zoneTypeCounts, subCountPerFrequency, revenuePerFrequency, safeSummary.totalZones, customerCountPerZone]);

  const filteredZones = zoneFilter === 'All' ? zonesData : zonesData.filter(z => z.areaType === zoneFilter);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: '#ffffff', color: '#0f2612' }}>
      {/* Sidebar */}
      <aside style={{ borderRight: '1px solid #e5f3ce', padding: 16, position: 'sticky', top: 0, height: '100vh', background:'#f9ffe9' }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.5, marginBottom: 16, color:'#2f6f1b' }}>EcoGrid</div>
        {(Array.isArray(['Dashboard','Zones','Subscriptions','Reports','Settings']) ? ['Dashboard','Zones','Subscriptions','Reports','Settings'] : []).map((item) => (
          <div key={item} style={{ padding: '10px 12px', borderRadius: 8, cursor: 'pointer', marginBottom: 6, background: item==='Dashboard'? '#e9f7cd' : 'transparent', color: item==='Dashboard'? '#2f6f1b' : '#4a6b39' }}>{item}</div>
        ))}
        <div style={{ marginTop: 24, fontSize: 12, color: '#4a6b39' }}>Quick Actions</div>
        <div style={{ display:'grid', gap:8, marginTop:8 }}>
          {(Array.isArray(['Add Zone','Add Subscription','View Reports','Settings']) ? ['Add Zone','Add Subscription','View Reports','Settings'] : []).map((b,i)=> (
            <button key={i} style={{ background:'#2f6f1b', color:'white', border:'1px solid #275c16', padding:'8px 10px', borderRadius:8, cursor:'pointer' }}>{b}</button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main style={{ overflow: 'auto', padding: 20 }}>
        {/* Top stats */}
        <section style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(200px,1fr))', gap:12 }}>
          <Card title="Total Zones" value={stats.totalZones} breakdown={[{label:'Urban', value:stats.zones.Urban, color:COLORS.Urban},{label:'Suburban', value:stats.zones.Suburban, color:COLORS.Suburban},{label:'Rural', value:stats.zones.Rural, color:COLORS.Rural}]} />
          <Card title="Active Subscriptions" value={stats.subscriptions} breakdown={(Array.isArray(summary?.subCountPerFrequency) ? summary.subCountPerFrequency : []).map(f => ({label: f._id?.charAt(0).toUpperCase() + f._id?.slice(1), value: f.subCount, color: COLORS[f._id] || '#94a3b8'}))} />
          <MiniCard title="Revenue Overview" value={`$${stats.revenue.toLocaleString()}`} accent="#f59e0b" />
          <MiniCard title="Customer Coverage" value={`${summary?.customerCoverage ?? 0}%`} accent={COLORS.Customers} />
        </section>

        {/* Map */}
        <section style={{ marginTop:16, background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #e5f3ce' }}>
            <div style={{ padding:12, fontWeight:700, color:'#0f2612' }}>Map</div>
            <div style={{ marginLeft:'auto', padding:12, display:'flex', gap:8, alignItems:'center', color:'#4a6b39' }}>
              {(Array.isArray(['Urban','Suburban','Rural','Customers']) ? ['Urban','Suburban','Rural','Customers'] : []).map(k => (
                <span key={k} style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:10, height:10, borderRadius:2, background:COLORS[k] }} /> {k}
                </span>
              ))}
            </div>
          </div>
          <div style={{ height: 360 }}>
            <MapContainer center={[7.2906, 80.6337]} zoom={12} style={{ height:'100%', width:'100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {(Array.isArray(zonesData) ? zonesData : []).map(z => (
                <Polygon key={z.id} positions={Array.isArray(z.coords) ? z.coords.map(([lat,lng]) => [lat,lng]) : []} pathOptions={{ color: COLORS[z.type], fillColor: COLORS[z.type], fillOpacity:0.25 }}
                  eventHandlers={{ click: () => setSelectedZone(z) }}>
                  <Tooltip>{z.name} • {z.type}</Tooltip>
                </Polygon>
              ))}
              {(Array.isArray(customers) ? customers : []).map(c => {
                // Use first address geo as marker position if available
                const pos = c.addresses && c.addresses[0] && c.addresses[0].geo && Array.isArray(c.addresses[0].geo.coordinates)
                  ? { lat: c.addresses[0].geo.coordinates[1], lng: c.addresses[0].geo.coordinates[0] }
                  : null;
                if (!pos) return null;
                return (
                  <Marker key={c._id} position={pos}>
                    <Tooltip>{c.fullName || 'Customer'}</Tooltip>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </section>

        {/* Tables */}
        <section style={{ marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Zones table */}
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12 }}>
            <Header title="Zones" right={
              <select value={zoneFilter} onChange={e=>setZoneFilter(e.target.value)} style={{ background:'#ffffff', color:'#0f2612', border:'1px solid #c9eaa4', padding:'6px 8px', borderRadius:8 }}>
                {(Array.isArray(['All','Urban','Suburban','Rural']) ? ['All','Urban','Suburban','Rural'] : []).map(o=> <option key={o} value={o}>{o}</option>)}
              </select>
            } />
            <table className="table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ color:'#4a6b39', textAlign:'left' }}>
                  {(Array.isArray(['Zone Name','Zone Type','Created Date','Customers Count','Actions']) ? ['Zone Name','Zone Type','Created Date','Customers Count','Actions'] : []).map(h=> (
                    <th key={h} style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredZones) ? filteredZones : []).map(z => (
                  <tr key={z.id}>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{z.name}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce', color:COLORS[z.type] }}>{z.type}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{z.createdAt}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{z.customers}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>
                      <button className="btn" style={{ marginRight:8 }}>Edit</button>
                      <button className="btn" style={{ background:'#dc2626', color:'white' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subs table */}
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12 }}>
            <Header title="Subscriptions" right={<button className="btn">Add Plan</button>} />
            <table className="table" style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ color:'#4a6b39', textAlign:'left' }}>
                  {(Array.isArray(['Plan Name','Frequency','Price (Urban, Suburban, Rural)','Active Users','Actions']) ? ['Plan Name','Frequency','Price (Urban, Suburban, Rural)','Active Users','Actions'] : []).map(h=> (
                    <th key={h} style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(plans) ? plans : []).map(p => (
                  <tr key={p._id || p.id}>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{p.name}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce', textTransform:'capitalize' }}>{p.frequency}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>
                      <span style={{ color:COLORS.Urban }}>${p.price?.Urban ?? '-'}</span>,{' '}
                      <span style={{ color:COLORS.Suburban }}>${p.price?.Suburban ?? '-'}</span>,{' '}
                      <span style={{ color:COLORS.Rural }}>${p.price?.Rural ?? '-'}</span>
                    </td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{p.users ?? '-'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>
                      <button className="btn" style={{ marginRight:8 }}>Edit</button>
                      <button className="btn" style={{ background:'#dc2626', color:'white' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Charts & Activity */}
        <section style={{ marginTop:16, display:'grid', gridTemplateColumns:'2fr 2fr 2fr 1.5fr', gap:16 }}>
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#0f2612' }}>Customer Distribution</div>
            <PieChart data={(Array.isArray(summary?.customerCountPerZone) ? summary.customerCountPerZone : []).map(z => ({ label: z.areaType, value: z.customerCount, color: COLORS[z.areaType] }))} />
          </div>
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#0f2612' }}>Revenue per Subscription</div>
            <BarChart data={(Array.isArray(summary?.revenuePerFrequency) ? summary.revenuePerFrequency : []).map(f => ({ label: f._id?.charAt(0).toUpperCase() + f._id?.slice(1), value: f.totalRevenue, color: COLORS[f._id] || '#94a3b8' }))} />
          </div>
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#0f2612' }}>Subscription Growth</div>
            <LineChart points={(Array.isArray(summary?.subscriptionGrowth) ? summary.subscriptionGrowth : []).map(s => ({ x: s._id, y: s.subCount }))} />
          </div>
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#0f2612' }}>Recent Activity</div>
            <ul style={{ listStyle:'none', padding:0, margin:0, display:'grid', gap:8 }}>
              {(Array.isArray([
                'New Urban Zone added in Kandy City',
                'Customer X subscribed to Weekly Plan',
                'Subscription Plan updated',
                'Peradeniya Rural zone reached 50 customers',
              ]) ? [
                'New Urban Zone added in Kandy City',
                'Customer X subscribed to Weekly Plan',
                'Subscription Plan updated',
                'Peradeniya Rural zone reached 50 customers',
              ] : []).map((t,i)=> (
                <li key={i} style={{ background:'#f9ffe9', border:'1px solid #e5f3ce', padding:10, borderRadius:8, color:'#2f6f1b' }}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* Modal */}
        {selectedZone && (
          <div onClick={()=>setSelectedZone(null)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'grid', placeItems:'center' }}>
            <div onClick={e=>e.stopPropagation()} style={{ width:460, background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontWeight:800, fontSize:18 }}>{selectedZone.name}</div>
                <div style={{ marginLeft:'auto', color:COLORS[selectedZone.type], fontWeight:700 }}>{selectedZone.type}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Info label="Customers" value={selectedZone.customers} />
                <Info label="Subscriptions" value={Math.floor(selectedZone.customers*0.6)} />
                <Info label="Revenue" value={`$${(selectedZone.customers*18).toLocaleString()}`} />
                <Info label="Created" value={selectedZone.createdAt} />
              </div>
              <div style={{ textAlign:'right', marginTop:12 }}>
                <button className="btn" onClick={()=>setSelectedZone(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function Card({ title, value, breakdown }) {
  return (
    <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
      <div style={{ color:'#4a6b39', fontSize:12 }}>{title}</div>
      <div style={{ fontWeight:800, fontSize:24, marginTop:4 }}>{value}</div>
      <div style={{ marginTop:8, display:'flex', gap:12, flexWrap:'wrap' }}>
        {breakdown.map((b,i)=> (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:6, color:'#0f2612' }}>
            <span style={{ width:10, height:10, borderRadius:2, background:b.color }} />
            <span>{b.label}: <strong>{b.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MiniCard({ title, value, accent }) {
  return (
    <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
      <div style={{ color:'#4a6b39', fontSize:12 }}>{title}</div>
      <div style={{ fontWeight:800, fontSize:24, marginTop:4, color:accent }}>{value}</div>
    </div>
  )
}

function Header({ title, right }) {
  return (
    <div style={{ display:'flex', alignItems:'center', borderBottom:'1px solid #e5f3ce', padding:'10px 12px' }}>
      <div style={{ fontWeight:800, color:'#0f2612' }}>{title}</div>
      <div style={{ marginLeft:'auto' }}>{right}</div>
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div style={{ background:'#f9ffe9', border:'1px solid #e5f3ce', borderRadius:8, padding:10 }}>
      <div style={{ color:'#4a6b39', fontSize:12 }}>{label}</div>
      <div style={{ fontWeight:800, marginTop:2, color:'#0f2612' }}>{value}</div>
    </div>
  )
}