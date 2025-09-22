import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Marker, Tooltip } from 'react-leaflet';
import { getSubscriptionSummary, getZones, getCustomers, getSubscriptions, getCustomerSubscriptions } from '../api';

// Real plans state
// ...existing code...

// Simple SVG charts (no extra deps)
  function PieChart({ data, size = 160 }) {
    console.log('PieChart render - data:', data, 'size:', size);
    const total = data.reduce((s, d) => s + (d.value || 0), 0)
    console.log('PieChart render - total:', total);
    let acc = 0
    const radius = size / 2
    const cx = radius
    const cy = radius
    
    // If no data or total is 0, show empty state
    if (!data || data.length === 0 || total === 0) {
      console.log('PieChart render - showing empty state');
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cy} r={radius} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={radius - 20} fill="#0f172a" />
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fill="#e2e8f0" style={{ fontSize: 14, fontWeight: 700 }}>No Data</text>
        </svg>
      )
    }
  
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const start = (acc / total) * Math.PI * 2
        acc += (d.value || 0)
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
  console.log('BarChart render - data:', data);
  if (!data || data.length === 0) {
    console.log('BarChart render - showing empty state');
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: '#64748b' }}>
        No Data Available
      </div>
    )
  }
  
  const max = Math.max(...data.map(d => d.value || 0), 1)
  console.log('BarChart render - max:', max);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height, gap: 10 }}>
      {data.map(d => (
        <div key={d.label} title={`${d.label}: ${d.value || 0}`} style={{ flex: 1 }}>
          <div style={{ background: d.color, height: `${((d.value || 0) / max) * 100}%`, borderRadius: 6 }} />
          <div style={{ marginTop: 6, textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

function LineChart({ points }) {
  console.log('LineChart render - points:', points);
  const width = 320
  const height = 140
  
  if (!points || points.length === 0) {
    console.log('LineChart render - showing empty state');
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, color: '#64748b' }}>
        No Data Available
      </div>
    )
  }
  
  const max = Math.max(...points.map(p => p.y || 0), 1)
  console.log('LineChart render - max:', max);
  
  // Handle single data point case
  if (points.length === 1) {
    console.log('LineChart render - single data point case');
    const x = width / 2
    const y = height - ((points[0].y || 0) / max) * height
    console.log('LineChart render - single point x:', x, 'y:', y);
    return (
      <svg width={width} height={height}>
        <circle cx={x} cy={y} r={5} fill="#60a5fa" />
        <text x={x} y={y - 10} textAnchor="middle" fontSize="12" fill="#64748b">
          {points[0].y || 0}
        </text>
      </svg>
    )
  }
  
  const stepX = width / (points.length - 1)
  console.log('LineChart render - multi-point case, stepX:', stepX);
  
  // Ensure all values are valid numbers
  const path = points.map((p, i) => {
    const x = i * stepX
    const y = height - ((p.y || 0) / max) * height
    console.log(`LineChart render - point ${i}: x=${x}, y=${y}, p.y=${p.y}`);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
  console.log('LineChart render - path:', path);
  
  return (
    <svg width={width} height={height}>
      <path d={path} stroke="#60a5fa" fill="none" strokeWidth={2} />
      {points.map((p, i) => {
        const x = i * stepX
        const y = height - ((p.y || 0) / max) * height
        return (
          <circle key={i} cx={x} cy={y} r={3} fill="#60a5fa" />
        )
      })}
    </svg>
  )
}

const COLORS = { Urban: '#ef4444', Suburban: '#3b82f6', Rural: '#22c55e', Customers: '#fb923c' }

export default function Dashboard() {
  const navigate = useNavigate()
  const [zoneFilter, setZoneFilter] = useState('All')
  const [selectedZone, setSelectedZone] = useState(null)
  const [summary, setSummary] = useState(null)
  const [zonesData, setZonesData] = useState([]) // Standardized zones data
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Real customers state
  const [customers, setCustomers] = useState([]);
  // Real plans state
  const [plans, setPlans] = useState([]);
  // Customer subscriptions state
  const [customerSubscriptions, setCustomerSubscriptions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      console.log('Dashboard useEffect - starting data fetch');
      setLoading(true)
      try {
        console.log('Dashboard useEffect - calling APIs...');
        const [summaryData, zones, customersData, plansData, customerSubsData] = await Promise.all([
          getSubscriptionSummary(),
          getZones(),
          (typeof getCustomers === 'function' ? getCustomers() : Promise.resolve([])),
          (typeof getSubscriptions === 'function' ? getSubscriptions() : Promise.resolve([])),
          (typeof getCustomerSubscriptions === 'function' ? getCustomerSubscriptions() : Promise.resolve([]))
        ])
        console.log('Dashboard useEffect - API calls completed:', { summaryData, zones, customersData, plansData, customerSubsData });
        console.log('Summary data details:', {
          customerCountPerZone: summaryData?.customerCountPerZone,
          customerDistribution: summaryData?.customerDistribution,
          subCountPerFrequency: summaryData?.subCountPerFrequency,
          revenuePerFrequency: summaryData?.revenuePerFrequency,
          revenuePerZone: summaryData?.revenuePerZone,
          subscriptionGrowth: summaryData?.subscriptionGrowth,
          zoneTypeCounts: summaryData?.zoneTypeCounts
        });
        
        // Debug chart data
        console.log('Chart data mapping:', {
          pieChartData: (Array.isArray(summaryData?.customerDistribution) ? summaryData.customerDistribution : []).map(z => ({ label: z.areaType, value: z.customerCount, color: COLORS[z.areaType] })),
          barChartData: (Array.isArray(summaryData?.revenuePerFrequency) ? summaryData.revenuePerFrequency : []).map(f => ({ label: f._id?.charAt(0).toUpperCase() + f._id?.slice(1), value: f.totalRevenue, color: COLORS[f._id] || '#94a3b8' })),
          lineChartData: (Array.isArray(summaryData?.subscriptionGrowth) ? summaryData.subscriptionGrowth : []).map(s => ({ x: s._id, y: s.subCount }))
        });
        
        setSummary(summaryData)
        setZonesData(zones || [])
        setCustomers(customersData || [])
        setPlans(plansData || [])
        setCustomerSubscriptions(customerSubsData || [])
        setError('')
        
        // Debug: Log zones data to see what we're getting
        console.log('Zones data for map:', zones);
        console.log('Customer subscriptions data:', customerSubsData);
      } catch (e) {
        console.error('Dashboard useEffect - Error occurred:', e);
        setError('Failed to load dashboard data: ' + e.message)
      } finally {
        console.log('Dashboard useEffect - setting loading to false');
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
  const revenuePerZone = safeSummary.revenuePerZone || [];
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

  // PDF Download Function
  const downloadPDFReport = useCallback(() => {
    try {
      // Check if we have data to generate report
      if (!summary || !customerCountPerZone || customerCountPerZone.length === 0) {
        alert('No data available to generate report. Please ensure the dashboard has loaded successfully.');
        return;
      }

      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('Please allow popups for this site to generate PDF reports.');
        return;
      }
      
      // Get current date for the report
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      
      // Calculate report data
      const totalCustomers = customerCountPerZone.reduce((sum, z) => sum + z.customerCount, 0);
      const avgCustomersPerZone = customerCountPerZone.length > 0 ? Math.round(totalCustomers / customerCountPerZone.length) : 0;
      const lowPerformingZones = customerCountPerZone.filter(zone => zone.customerCount < 10);
    
    // Generate recommendations
    const recommendations = [];
    if (avgCustomersPerZone < 15) {
      recommendations.push('Consider consolidating low-performing zones');
    }
    if (summary?.customerCoverage < 70) {
      recommendations.push('Focus on increasing subscription coverage');
    }
    if (customerCountPerZone.some(z => z.customerCount > 50)) {
      recommendations.push('High-density zones may need service expansion');
    }
    if (recommendations.length === 0) {
      recommendations.push('Current zone configuration is optimal');
    }

      // HTML content for PDF
      const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Zone Coverage & Efficiency Analysis Report</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
            line-height: 1.6;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #22c55e; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .header h1 { 
            color: #0f2612; 
            margin: 0; 
            font-size: 28px;
          }
          .header p { 
            color: #4a6b39; 
            margin: 5px 0; 
            font-size: 14px;
          }
          .section { 
            margin-bottom: 30px; 
            page-break-inside: avoid;
          }
          .section h2 { 
            color: #0f2612; 
            border-bottom: 2px solid #c9eaa4; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
            font-size: 20px;
          }
          .section h3 { 
            color: #2f6f1b; 
            margin-bottom: 15px;
            font-size: 16px;
          }
          .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 15px; 
            margin-bottom: 20px;
          }
          .metric-card { 
            border: 1px solid #c9eaa4; 
            border-radius: 8px; 
            padding: 15px; 
            background: #f9ffe9;
          }
          .metric-card h4 { 
            margin: 0 0 10px 0; 
            color: #0f2612; 
            font-size: 14px;
          }
          .metric-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #22c55e; 
            margin: 0;
          }
          .zone-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 15px;
          }
          .zone-table th, .zone-table td { 
            border: 1px solid #c9eaa4; 
            padding: 12px; 
            text-align: left;
          }
          .zone-table th { 
            background: #f9ffe9; 
            color: #0f2612; 
            font-weight: bold;
          }
          .zone-table tr:nth-child(even) { 
            background: #f9ffe9;
          }
          .status-high { color: #166534; font-weight: bold; }
          .status-medium { color: #92400e; font-weight: bold; }
          .status-low { color: #991b1b; font-weight: bold; }
          .alert-box { 
            border: 1px solid #f59e0b; 
            background: #fef3c7; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0;
          }
          .recommendation-box { 
            border: 1px solid #3b82f6; 
            background: #dbeafe; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0;
          }
          .efficiency-box { 
            border: 1px solid #22c55e; 
            background: #dcfce7; 
            padding: 15px; 
            border-radius: 8px; 
            margin: 15px 0;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666; 
            font-size: 12px; 
            border-top: 1px solid #e5f3ce; 
            padding-top: 20px;
          }
          @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Zone Coverage & Efficiency Analysis Report</h1>
          <p>EcoGrid Waste Management System</p>
          <p>Generated on: ${currentDate} at ${currentTime}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h4>Total Zones</h4>
              <p class="metric-value">${stats.totalZones}</p>
            </div>
            <div class="metric-card">
              <h4>Total Customers</h4>
              <p class="metric-value">${totalCustomers}</p>
            </div>
            <div class="metric-card">
              <h4>Active Subscriptions</h4>
              <p class="metric-value">${stats.subscriptions}</p>
            </div>
            <div class="metric-card">
              <h4>Customer Coverage</h4>
              <p class="metric-value">${summary?.customerCoverage || 0}%</p>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Zone Performance Analysis</h2>
          <table class="zone-table">
            <thead>
              <tr>
                <th>Zone Name</th>
                <th>Area Type</th>
                <th>Customers</th>
                <th>Efficiency</th>
                <th>Actual Revenue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${customerCountPerZone.map(zone => {
                const efficiency = totalCustomers > 0 ? ((zone.customerCount / totalCustomers) * 100).toFixed(1) : 0;
                const zoneRevenueData = revenuePerZone.find(r => r.zoneId === zone.zoneId);
                const actualRevenue = zoneRevenueData ? zoneRevenueData.totalRevenue : 0;
                const status = zone.customerCount > 20 ? 'High Performance' : zone.customerCount > 10 ? 'Medium Performance' : 'Low Performance';
                const statusClass = zone.customerCount > 20 ? 'status-high' : zone.customerCount > 10 ? 'status-medium' : 'status-low';
                
                return `
                  <tr>
                    <td>${zone.zoneName || 'Unknown Zone'}</td>
                    <td>${zone.areaType || 'Unknown'}</td>
                    <td>${zone.customerCount}</td>
                    <td>${efficiency}%</td>
                    <td>$${actualRevenue.toLocaleString()}</td>
                    <td class="${statusClass}">${status}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Coverage Analysis</h2>
          
          <div class="alert-box">
            <h3>⚠️ Coverage Gaps Identified</h3>
            <p>${lowPerformingZones.length > 0 
              ? `${lowPerformingZones.length} zones have less than 10 customers. Consider expanding service or adjusting boundaries.`
              : 'All zones are performing well with adequate customer coverage.'}</p>
          </div>

          <div class="recommendation-box">
            <h3>💡 Optimization Recommendations</h3>
            <ul>
              ${recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
          </div>

          <div class="efficiency-box">
            <h3>📈 Service Efficiency Metrics</h3>
            <div class="metrics-grid">
              <div class="metric-card">
                <h4>Coverage Rate</h4>
                <p class="metric-value">${summary?.customerCoverage || 0}%</p>
              </div>
              <div class="metric-card">
                <h4>Average Customers per Zone</h4>
                <p class="metric-value">${avgCustomersPerZone}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Zone Distribution</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <h4>Urban Zones</h4>
              <p class="metric-value">${stats.zones.Urban}</p>
            </div>
            <div class="metric-card">
              <h4>Suburban Zones</h4>
              <p class="metric-value">${stats.zones.Suburban}</p>
            </div>
            <div class="metric-card">
              <h4>Rural Zones</h4>
              <p class="metric-value">${stats.zones.Rural}</p>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This report was generated automatically by the EcoGrid Waste Management System</p>
          <p>For questions or support, please contact your system administrator</p>
        </div>
      </body>
      </html>
      `;

      // Write content to new window and trigger print
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    
      // Wait for content to load then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Error generating PDF report. Please try again.');
    }
  }, [customerCountPerZone, summary, stats]);

  console.log('Dashboard render - loading:', loading, 'error:', error, 'zonesData:', zonesData);
  
  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '100vh', background: '#ffffff', color: '#0f2612' }}>
      {/* Sidebar */}
      <aside style={{ borderRight: '1px solid #e5f3ce', padding: 16, position: 'sticky', top: 0, height: '100vh', background:'#f9ffe9' }}>
        <div style={{ fontWeight: 800, letterSpacing: 0.5, marginBottom: 16, color:'#2f6f1b' }}>EcoGrid</div>
        {(Array.isArray(['Dashboard','Zones','Subscriptions','Map','Reports','Settings']) ? ['Dashboard','Zones','Subscriptions','Map','Reports','Settings'] : []).map((item, index) => (
          <div 
            key={item} 
            onClick={() => {
              if (item === 'Dashboard') navigate('/dashboard')
              else if (item === 'Zones') navigate('/zones')
              else if (item === 'Subscriptions') navigate('/subscriptions')
              else if (item === 'Map') navigate('/map')
              else if (item === 'Reports') navigate('/reports')
              else if (item === 'Settings') navigate('/settings')
            }}
            style={{ 
              padding: '10px 12px', 
              borderRadius: 8, 
              cursor: 'pointer', 
              marginBottom: 6, 
              background: item==='Dashboard'? '#e9f7cd' : 'transparent', 
              color: item==='Dashboard'? '#2f6f1b' : '#4a6b39',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              if (item !== 'Dashboard') {
                e.target.style.background = '#e9f7cd'
                e.target.style.color = '#2f6f1b'
              }
            }}
            onMouseLeave={(e) => {
              if (item !== 'Dashboard') {
                e.target.style.background = 'transparent'
                e.target.style.color = '#4a6b39'
              }
            }}
          >
            {item}
          </div>
        ))}
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
              {(Array.isArray(zonesData) ? zonesData : []).map(z => {
                // Check if zone has polygon data
                if (!z.polygon || !z.polygon.coordinates || !Array.isArray(z.polygon.coordinates[0])) {
                  console.log('Zone missing polygon data:', z.name, z.polygon);
                  return null;
                }
                
                // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
                const positions = z.polygon.coordinates[0].map(([lng, lat]) => [lat, lng]);
                
                return (
                  <Polygon 
                    key={z._id || z.id} 
                    positions={positions} 
                    pathOptions={{ 
                      color: COLORS[z.areaType] || '#666', 
                      fillColor: COLORS[z.areaType] || '#666', 
                      fillOpacity: 0.25,
                      weight: 2
                    }}
                    eventHandlers={{ click: () => setSelectedZone(z) }}
                  >
                    <Tooltip>
                      <div style={{ textAlign: 'center' }}>
                        <strong>{z.name}</strong><br/>
                        Type: {z.areaType}<br/>
                        Customers: {z.customersCount || 0}
                      </div>
                    </Tooltip>
                  </Polygon>
                );
              })}
              
              {/* Show message if no zones with polygon data */}
              {zonesData && zonesData.length > 0 && zonesData.every(z => !z.polygon || !z.polygon.coordinates) && (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  background: 'rgba(255,255,255,0.9)', 
                  padding: '20px', 
                  borderRadius: '8px',
                  textAlign: 'center',
                  zIndex: 1000
                }}>
                  <div>Zones found but no polygon data available</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    Check if zones have been properly created with coordinates
                  </div>
                </div>
              )}
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
                  {(Array.isArray(['Zone Name','Zone Type','Created Date','Customers Count']) ? ['Zone Name','Zone Type','Created Date','Customers Count'] : []).map(h=> (
                    <th key={h} style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(filteredZones) ? filteredZones : []).map(z => (
                  <tr key={z._id || z.id}>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{z.name}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce', color:COLORS[z.areaType] }}>{z.areaType}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{z.createdAt}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{z.customersCount || 0}</td>
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
                  {(Array.isArray(['Customer Name','Plan Name','Zone Name','Status','Started Date']) ? ['Customer Name','Plan Name','Zone Name','Status','Started Date'] : []).map(h=> (
                    <th key={h} style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(customerSubscriptions) ? customerSubscriptions : []).map(sub => (
                  <tr key={sub._id || sub.id}>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{sub.customerId?.fullName || 'N/A'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{sub.planId?.planName || 'N/A'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{sub.zoneId?.name || 'N/A'}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce', textTransform:'capitalize', color: sub.status === 'active' ? 'green' : sub.status === 'paused' ? 'orange' : 'red' }}>{sub.status}</td>
                    <td style={{ padding:'10px 12px', borderBottom:'1px solid #e5f3ce' }}>{sub.startedAt ? new Date(sub.startedAt).toLocaleDateString() : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reports Section */}
        <section style={{ marginTop:16, background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, overflow:'hidden' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #e5f3ce', padding:'12px 16px', background:'#f9ffe9' }}>
            <div style={{ fontWeight:800, fontSize:18, color:'#0f2612' }}>📊 Zone Coverage & Efficiency Analysis Report</div>
            <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:12, color:'#4a6b39', background:'#e9f7cd', padding:'4px 8px', borderRadius:6 }}>
                Generated: {new Date().toLocaleDateString()}
              </span>
              <button 
                onClick={downloadPDFReport}
                disabled={!summary || !customerCountPerZone || customerCountPerZone.length === 0}
                style={{
                  background: (!summary || !customerCountPerZone || customerCountPerZone.length === 0) ? '#9ca3af' : '#22c55e',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: (!summary || !customerCountPerZone || customerCountPerZone.length === 0) ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  opacity: (!summary || !customerCountPerZone || customerCountPerZone.length === 0) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.background = '#16a34a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) {
                    e.target.style.background = '#22c55e';
                  }
                }}
              >
                📄 Download PDF
              </button>
            </div>
          </div>
          
          <div style={{ padding:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            {/* Zone Performance Metrics */}
            <div>
              <h3 style={{ margin:'0 0 12px 0', color:'#0f2612', fontSize:16, fontWeight:700 }}>Zone Performance Metrics</h3>
              <div style={{ display:'grid', gap:12 }}>
                {(() => {
                  const zoneMetrics = (Array.isArray(summary?.customerCountPerZone) ? summary.customerCountPerZone : []).map(zone => {
                    const totalCustomers = customerCountPerZone.reduce((sum, z) => sum + z.customerCount, 0);
                    const efficiency = totalCustomers > 0 ? ((zone.customerCount / totalCustomers) * 100).toFixed(1) : 0;
                    
                    // Get actual revenue for this zone from backend data
                    const zoneRevenueData = revenuePerZone.find(r => r.zoneId === zone.zoneId);
                    const actualRevenue = zoneRevenueData ? zoneRevenueData.totalRevenue : 0;
                    
                    // Debug logging
                    console.log(`Zone ${zone.zoneName}:`, {
                      zoneId: zone.zoneId,
                      zoneRevenueData,
                      actualRevenue,
                      revenuePerZone: revenuePerZone
                    });
                    
                    return {
                      ...zone,
                      efficiency: parseFloat(efficiency),
                      actualRevenue: actualRevenue,
                      status: zone.customerCount > 20 ? 'High Performance' : zone.customerCount > 10 ? 'Medium Performance' : 'Low Performance'
                    };
                  });
                  
                  return zoneMetrics.map((zone, index) => (
                    <div key={index} style={{ 
                      background:'#f9ffe9', 
                      border:'1px solid #e5f3ce', 
                      borderRadius:8, 
                      padding:12,
                      borderLeft: `4px solid ${COLORS[zone.areaType] || '#666'}`
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <div style={{ fontWeight:700, color:'#0f2612' }}>{zone.zoneName || 'Unknown Zone'}</div>
                        <div style={{ 
                          fontSize:11, 
                          padding:'2px 6px', 
                          borderRadius:4,
                          background: zone.status === 'High Performance' ? '#dcfce7' : 
                                    zone.status === 'Medium Performance' ? '#fef3c7' : '#fee2e2',
                          color: zone.status === 'High Performance' ? '#166534' : 
                                zone.status === 'Medium Performance' ? '#92400e' : '#991b1b'
                        }}>
                          {zone.status}
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, fontSize:12 }}>
                        <div>
                          <div style={{ color:'#4a6b39' }}>Customers</div>
                          <div style={{ fontWeight:600, color:'#0f2612' }}>{zone.customerCount}</div>
                        </div>
                        <div>
                          <div style={{ color:'#4a6b39' }}>Efficiency</div>
                          <div style={{ fontWeight:600, color:'#0f2612' }}>{zone.efficiency}%</div>
                        </div>
                        <div>
                          <div style={{ color:'#4a6b39' }}>Actual Revenue</div>
                          <div style={{ fontWeight:600, color:'#0f2612' }}>${zone.actualRevenue.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Coverage Analysis */}
            <div>
              <h3 style={{ margin:'0 0 12px 0', color:'#0f2612', fontSize:16, fontWeight:700 }}>Coverage Analysis</h3>
              <div style={{ display:'grid', gap:12 }}>
                {/* Coverage Gaps */}
                <div style={{ background:'#fef3c7', border:'1px solid #f59e0b', borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight:700, color:'#92400e', marginBottom:8 }}>⚠️ Coverage Gaps Identified</div>
                  <div style={{ fontSize:12, color:'#92400e' }}>
                    {(() => {
                      const lowPerformingZones = (Array.isArray(summary?.customerCountPerZone) ? summary.customerCountPerZone : [])
                        .filter(zone => zone.customerCount < 10);
                      return lowPerformingZones.length > 0 
                        ? `${lowPerformingZones.length} zones have less than 10 customers. Consider expanding service or adjusting boundaries.`
                        : 'All zones are performing well with adequate customer coverage.';
                    })()}
                  </div>
                </div>

                {/* Optimization Recommendations */}
                <div style={{ background:'#dbeafe', border:'1px solid #3b82f6', borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight:700, color:'#1e40af', marginBottom:8 }}>💡 Optimization Recommendations</div>
                  <ul style={{ margin:0, paddingLeft:16, fontSize:12, color:'#1e40af' }}>
                    {(() => {
                      const recommendations = [];
                      const totalCustomers = customerCountPerZone.reduce((sum, z) => sum + z.customerCount, 0);
                      const avgCustomersPerZone = totalCustomers / (customerCountPerZone.length || 1);
                      
                      if (avgCustomersPerZone < 15) {
                        recommendations.push('Consider consolidating low-performing zones');
                      }
                      if (summary?.customerCoverage < 70) {
                        recommendations.push('Focus on increasing subscription coverage');
                      }
                      if (customerCountPerZone.some(z => z.customerCount > 50)) {
                        recommendations.push('High-density zones may need service expansion');
                      }
                      if (recommendations.length === 0) {
                        recommendations.push('Current zone configuration is optimal');
                      }
                      
                      return recommendations.map((rec, index) => (
                        <li key={index} style={{ marginBottom:4 }}>{rec}</li>
                      ));
                    })()}
                  </ul>
                </div>

                {/* Service Efficiency */}
                <div style={{ background:'#dcfce7', border:'1px solid #22c55e', borderRadius:8, padding:12 }}>
                  <div style={{ fontWeight:700, color:'#166534', marginBottom:8 }}>📈 Service Efficiency</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:12 }}>
                    <div>
                      <div style={{ color:'#166534' }}>Coverage Rate</div>
                      <div style={{ fontWeight:600, color:'#0f2612' }}>{summary?.customerCoverage || 0}%</div>
                    </div>
                    <div>
                      <div style={{ color:'#166534' }}>Avg Customers/Zone</div>
                      <div style={{ fontWeight:600, color:'#0f2612' }}>
                        {customerCountPerZone.length > 0 
                          ? Math.round(customerCountPerZone.reduce((sum, z) => sum + z.customerCount, 0) / customerCountPerZone.length)
                          : 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Charts & Activity */}
        <section style={{ marginTop:16, display:'grid', gridTemplateColumns:'2fr 2fr 2fr 1.5fr', gap:16 }}>
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#0f2612' }}>Customer Distribution</div>
            {(() => {
              const pieData = (Array.isArray(summary?.customerDistribution) ? summary.customerDistribution : []).map(z => ({ 
                label: z.areaType || 'Unknown', 
                value: Number(z.customerCount) || 0, 
                color: COLORS[z.areaType] || '#666' 
              }));
              console.log('PieChart data:', JSON.stringify(pieData, null, 2));
              console.log('PieChart raw data:', JSON.stringify(summary?.customerDistribution, null, 2));
              console.log('PieChart processed values:', JSON.stringify(pieData.map(d => ({ label: d.label, value: d.value, color: d.color })), null, 2));
              return <PieChart data={pieData} />;
            })()}
          </div>
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#0f2612' }}>Revenue per Subscription</div>
            {(() => {
              const barData = (Array.isArray(summary?.revenuePerFrequency) ? summary.revenuePerFrequency : []).map(f => ({ 
                label: f._id?.charAt(0).toUpperCase() + f._id?.slice(1) || 'Unknown', 
                value: Number(f.totalRevenue) || 0, 
                color: COLORS[f._id] || '#94a3b8' 
              }));
              console.log('BarChart data:', JSON.stringify(barData, null, 2));
              console.log('BarChart raw data:', JSON.stringify(summary?.revenuePerFrequency, null, 2));
              console.log('BarChart processed values:', JSON.stringify(barData.map(d => ({ label: d.label, value: d.value, color: d.color })), null, 2));
              return <BarChart data={barData} />;
            })()}
          </div>
          <div style={{ background:'#ffffff', border:'1px solid #c9eaa4', borderRadius:12, padding:12 }}>
            <div style={{ fontWeight:700, marginBottom:8, color:'#0f2612' }}>Subscription Growth</div>
            {(() => {
              const lineData = (Array.isArray(summary?.subscriptionGrowth) ? summary.subscriptionGrowth : []).map(s => ({ 
                x: s._id || 'Unknown', 
                y: Number(s.subCount) || 0 
              }));
              console.log('LineChart data:', JSON.stringify(lineData, null, 2));
              console.log('LineChart raw data:', JSON.stringify(summary?.subscriptionGrowth, null, 2));
              console.log('LineChart processed values:', JSON.stringify(lineData.map(d => ({ x: d.x, y: d.y })), null, 2));
              return <LineChart points={lineData} />;
            })()}
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
                <div style={{ marginLeft:'auto', color:COLORS[selectedZone.areaType], fontWeight:700 }}>{selectedZone.areaType}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Info label="Customers" value={selectedZone.customersCount || 0} />
                <Info label="Subscriptions" value={Math.floor((selectedZone.customersCount || 0)*0.6)} />
                <Info label="Revenue" value={`$${((selectedZone.customersCount || 0)*18).toLocaleString()}`} />
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