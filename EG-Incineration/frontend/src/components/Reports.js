import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../apiClient';
import './Reports.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports() {
  const [report, setReport] = useState({
    totalWeight: 0,
    totalEnergy: 0,
    totalEmissions: 0,
    totalLogs: 0,
    dailyWeights: [],
    dailyEnergy: [],
    dailyEmissions: [],
    dates: [],
    aiStats: {
      totalAccepted: 0,
      totalRecommendations: 0,
      avgPredictedEnergy: 0,
      avgPredictedEmissions: 0
    }
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // AI recommendation UI state
  const [waste, setWaste] = useState({ paper_pct: 30, plastic_pct: 15, organic_pct: 40, moisture_pct: 15 });
  const [constraints, setConstraints] = useState({
    airflow_min: 200, airflow_max: 600,
    grate_speed_min: 0.5, grate_speed_max: 2.0,
    feed_rate_min: 3, feed_rate_max: 9,
    o2_target_min: 3, o2_target_max: 9,
    burner_temp_min: 750, burner_temp_max: 1000,
    emissions_cap: 200,
  });
  const [reco, setReco] = useState(null);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/waste/reports/daily');
        const data = res.data;
        console.log('Reports data received:', data);
        setReport({
          totalWeight: data.totalWeight || 0,
          totalEnergy: data.totalEnergy || 0,
          totalEmissions: data.totalEmissions || 0,
          totalLogs: data.totalLogs || 0,
          dailyWeights: data.dailyWeights || [],
          dailyEnergy: data.dailyEnergy || [],
          dailyEmissions: data.dailyEmissions || [],
          dates: data.dates || [],
          aiStats: data.aiStats || {
            totalAccepted: 0,
            totalRecommendations: 0,
            avgPredictedEnergy: 0,
            avgPredictedEmissions: 0
          }
        });
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err.response?.data?.message || 'Failed to load report data. Please check if the backend server is running and try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const weightChartData = {
    labels: report.dates.length > 0 ? report.dates : report.dailyWeights.map((_, i) => `Log ${i + 1}`),
    datasets: [
      {
        label: 'Weight (kg)',
        data: report.dailyWeights,
        backgroundColor: 'rgba(136, 201, 50, 0.8)',
        borderColor: '#262b12',
        borderWidth: 2,
        borderRadius: 5,
        barThickness: 20,
      },
    ],
  };

  const energyChartData = {
    labels: report.dates.length > 0 ? report.dates : report.dailyEnergy.map((_, i) => `Log ${i + 1}`),
    datasets: [
      {
        label: 'Energy (kWh)',
        data: report.dailyEnergy,
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: '#262b12',
        borderWidth: 2,
        borderRadius: 5,
        barThickness: 20,
      },
    ],
  };

  const emissionsChartData = {
    labels: report.dates.length > 0 ? report.dates : report.dailyEmissions.map((_, i) => `Log ${i + 1}`),
    datasets: [
      {
        label: 'Emissions (kg CO2)',
        data: report.dailyEmissions,
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: '#262b12',
        borderWidth: 2,
        borderRadius: 5,
        barThickness: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { color: '#262b12', font: { size: 14 } } },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Value', color: '#262b12' },
        ticks: { color: '#262b12' },
      },
      x: {
        title: { display: true, text: 'Date', color: '#262b12' },
        ticks: { 
          color: '#262b12',
          maxRotation: 45,
          minRotation: 0
        },
      },
    },
  };

  const handleRecommend = async () => {
    setReco(null);
    setRecoError(null);
    setRecoLoading(true);
    try {
      const payload = { waste, constraints, lambda_penalty: 0.5, n_samples: 400 };
      const res = await api.post('/api/waste/recommend', payload);
      setReco(res.data);
    } catch (err) {
      console.error('Recommendation error:', err);
      setRecoError(err.response?.data?.error || 'Failed to fetch recommendation.');
    } finally {
      setRecoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="report-container">
        <h2>Daily Reports</h2>
        <div className="loading-state">
          <p>Loading report data...</p>
          <p className="loading-note">Please ensure the backend server is running on port 5000</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-container">
        <h2>Daily Reports</h2>
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="page-header">
        <h2>Waste Management Analytics</h2>
        <p className="page-description">Comprehensive insights into waste processing performance and AI recommendations</p>
      </div>
      
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <h3>Total Waste Processed</h3>
          <p className="stat-value">{report.totalWeight} kg</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <h3>Total Energy Generated</h3>
          <p className="stat-value">{report.totalEnergy} kWh</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <h3>Total Emissions Offset</h3>
          <p className="stat-value">{report.totalEmissions} kg CO2</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <h3>Total Logs</h3>
          <p className="stat-value">{report.totalLogs || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <h3>AI Accepted</h3>
          <p className="stat-value">{report.aiStats?.totalAccepted || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <h3>Avg Predicted Energy</h3>
          <p className="stat-value">{report.aiStats?.avgPredictedEnergy || 0} kWh</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <h3>Avg Predicted Emissions</h3>
          <p className="stat-value">{report.aiStats?.avgPredictedEmissions || 0} kg</p>
        </div>
      </div>
      
      {report.dailyWeights.length === 0 ? (
        <div className="no-data-state">
          <p>No waste logs available.</p>
          <p>Please add some waste logs to see analytics.</p>
        </div>
      ) : (
        <div className="chart-section">
          <div className="chart-wrapper">
            <h3>Waste Weight Over Time</h3>
            <Bar data={weightChartData} options={chartOptions} height={300} />
          </div>
          <div className="chart-wrapper">
            <h3>Energy Generation Over Time</h3>
            <Bar data={energyChartData} options={chartOptions} height={300} />
          </div>
          <div className="chart-wrapper">
            <h3>Emissions Offset Over Time</h3>
            <Bar data={emissionsChartData} options={chartOptions} height={300} />
          </div>
        </div>
      )}
      
      <div className="ai-section">
        <div className="section-header">
          <h3>🤖 AI Optimization Engine</h3>
          <p className="section-description">Get intelligent recommendations for optimal waste processing settings</p>
        </div>
        
        <div className="ai-inputs">
          <div className="input-grid">
            <div className="input-group">
              <label htmlFor="paper-pct">Paper %</label>
              <input 
                id="paper-pct"
                type="number" 
                min="0" 
                max="100" 
                value={waste.paper_pct} 
                onChange={(e) => setWaste({ ...waste, paper_pct: Number(e.target.value) })} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="plastic-pct">Plastic %</label>
              <input 
                id="plastic-pct"
                type="number" 
                min="0" 
                max="100" 
                value={waste.plastic_pct} 
                onChange={(e) => setWaste({ ...waste, plastic_pct: Number(e.target.value) })} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="organic-pct">Organic %</label>
              <input 
                id="organic-pct"
                type="number" 
                min="0" 
                max="100" 
                value={waste.organic_pct} 
                onChange={(e) => setWaste({ ...waste, organic_pct: Number(e.target.value) })} 
              />
            </div>
            <div className="input-group">
              <label htmlFor="moisture-pct">Moisture %</label>
              <input 
                id="moisture-pct"
                type="number" 
                min="0" 
                max="100" 
                value={waste.moisture_pct} 
                onChange={(e) => setWaste({ ...waste, moisture_pct: Number(e.target.value) })} 
              />
            </div>
          </div>
          <div className="input-note">
            <small>💡 Ensure the four percentages sum to approximately 100% for accurate predictions</small>
          </div>
        </div>
        
        <div className="ai-actions">
          <button disabled={recoLoading} onClick={handleRecommend} className="recommend-button">
            {recoLoading ? '🔄 Calculating...' : '🚀 Get AI Recommendations'}
          </button>
        </div>
        
        {recoError && <div className="alert alert-error">{recoError}</div>}
        
        {reco && (
          <div className="reco-result">
            <h4>🎯 Optimized Settings</h4>
            <div className="settings-grid">
              <div className="setting-item">
                <span className="setting-label">Airflow</span>
                <span className="setting-value">{Number(reco.settings?.airflow).toFixed(1)}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Grate Speed</span>
                <span className="setting-value">{Number(reco.settings?.grate_speed).toFixed(2)}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Feed Rate</span>
                <span className="setting-value">{Number(reco.settings?.feed_rate).toFixed(2)}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">O2 Target</span>
                <span className="setting-value">{Number(reco.settings?.o2_target).toFixed(2)}</span>
              </div>
              <div className="setting-item">
                <span className="setting-label">Burner Temp</span>
                <span className="setting-value">{Number(reco.settings?.burner_temp).toFixed(0)}°C</span>
              </div>
            </div>
            <div className="predictions">
              <div className="prediction-item">
                <span className="prediction-label">⚡ Predicted Energy</span>
                <span className="prediction-value">{Number(reco.pred_energy).toFixed(2)} kWh</span>
              </div>
              <div className="prediction-item">
                <span className="prediction-label">🌱 Predicted Emissions</span>
                <span className="prediction-value">{Number(reco.pred_emissions).toFixed(2)} kg CO2</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="navigation-actions">
        <button onClick={() => window.history.back()} className="back-button">
          Back to Previous Page
        </button>
      </div>
    </div>
  );
}

export default Reports;