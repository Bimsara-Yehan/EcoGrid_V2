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
  });
  const [monthlyReport, setMonthlyReport] = useState({
    totalWeight: 0,
    totalEnergy: 0,
    totalEmissions: 0,
    totalLogs: 0,
    avgDailyWeight: 0,
    avgDailyEnergy: 0,
    avgDailyEmissions: 0,
    avgDailyLogs: 0,
    dailyWeights: [],
    dailyEnergy: [],
    dailyEmissions: [],
    dailyLogs: [],
    dates: [],
    weeklyWeights: [],
    weeklyEnergy: [],
    weeklyEmissions: [],
    weeklyLogs: [],
    weekDates: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    monthName: new Date().toLocaleString('default', { month: 'long' })
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'

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

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/waste/reports/daily');
      const data = res.data;
      setReport({
        totalWeight: data.totalWeight || 0,
        totalEnergy: data.totalEnergy || 0,
        totalEmissions: data.totalEmissions || 0,
        totalLogs: data.totalLogs || 0,
        dailyWeights: data.dailyWeights || [],
        dailyEnergy: data.dailyEnergy || [],
        dailyEmissions: data.dailyEmissions || [],
        dates: data.dates || [],
      });
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.response?.data?.message || 'Failed to load report data. Please check if the backend server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async (year = null, month = null) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);
      if (month) params.append('month', month);
      
      const res = await api.get(`/api/waste/reports/monthly?${params.toString()}`);
      const data = res.data;
      setMonthlyReport({
        totalWeight: data.totalWeight || 0,
        totalEnergy: data.totalEnergy || 0,
        totalEmissions: data.totalEmissions || 0,
        totalLogs: data.totalLogs || 0,
        avgDailyWeight: data.avgDailyWeight || 0,
        avgDailyEnergy: data.avgDailyEnergy || 0,
        avgDailyEmissions: data.avgDailyEmissions || 0,
        avgDailyLogs: data.avgDailyLogs || 0,
        dailyWeights: data.dailyWeights || [],
        dailyEnergy: data.dailyEnergy || [],
        dailyEmissions: data.dailyEmissions || [],
        dailyLogs: data.dailyLogs || [],
        dates: data.dates || [],
        weeklyWeights: data.weeklyWeights || [],
        weeklyEnergy: data.weeklyEnergy || [],
        weeklyEmissions: data.weeklyEmissions || [],
        weeklyLogs: data.weeklyLogs || [],
        weekDates: data.weekDates || [],
        month: data.month || new Date().getMonth() + 1,
        year: data.year || new Date().getFullYear(),
        monthName: data.monthName || new Date().toLocaleString('default', { month: 'long' })
      });
    } catch (err) {
      console.error('Error fetching monthly report:', err);
      setError(err.response?.data?.message || 'Failed to load monthly report data. Please check if the backend server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchReport();
    } else {
      fetchMonthlyReport();
    }
  }, [viewMode]);

  const weightChartData = {
    labels: viewMode === 'daily' 
      ? (report.dates.length > 0 ? report.dates : report.dailyWeights.map((_, i) => `Log ${i + 1}`))
      : (monthlyReport.dates.length > 0 ? monthlyReport.dates : monthlyReport.dailyWeights.map((_, i) => `Day ${i + 1}`)),
    datasets: [
      {
        label: 'Weight (kg)',
        data: viewMode === 'daily' ? report.dailyWeights : monthlyReport.dailyWeights,
        backgroundColor: 'rgba(136, 201, 50, 0.8)',
        borderColor: '#262b12',
        borderWidth: 2,
        borderRadius: 5,
        barThickness: 20,
      },
    ],
  };

  const energyChartData = {
    labels: viewMode === 'daily' 
      ? (report.dates.length > 0 ? report.dates : report.dailyEnergy.map((_, i) => `Log ${i + 1}`))
      : (monthlyReport.dates.length > 0 ? monthlyReport.dates : monthlyReport.dailyEnergy.map((_, i) => `Day ${i + 1}`)),
    datasets: [
      {
        label: 'Energy (kWh)',
        data: viewMode === 'daily' ? report.dailyEnergy : monthlyReport.dailyEnergy,
        backgroundColor: 'rgba(76, 175, 80, 0.8)',
        borderColor: '#262b12',
        borderWidth: 2,
        borderRadius: 5,
        barThickness: 20,
      },
    ],
  };

  const emissionsChartData = {
    labels: viewMode === 'daily' 
      ? (report.dates.length > 0 ? report.dates : report.dailyEmissions.map((_, i) => `Log ${i + 1}`))
      : (monthlyReport.dates.length > 0 ? monthlyReport.dates : monthlyReport.dailyEmissions.map((_, i) => `Day ${i + 1}`)),
    datasets: [
      {
        label: 'Emissions (kg CO2)',
        data: viewMode === 'daily' ? report.dailyEmissions : monthlyReport.dailyEmissions,
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
        <h2>Waste Management Analytics</h2>
        <div className="loading-state">
          <div className="loading-spinner"></div>
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
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            Daily View
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly View
          </button>
        </div>
      </div>
      
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-icon">🗑️</div>
          <h3>{viewMode === 'daily' ? 'Total Waste Processed' : 'Monthly Waste Processed'}</h3>
          <p className="stat-value">
            {viewMode === 'daily' ? report.totalWeight : monthlyReport.totalWeight} kg
          </p>
          {viewMode === 'monthly' && (
            <p className="stat-subtitle">Avg: {monthlyReport.avgDailyWeight} kg/day</p>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <h3>{viewMode === 'daily' ? 'Total Energy Generated' : 'Monthly Energy Generated'}</h3>
          <p className="stat-value">
            {viewMode === 'daily' ? report.totalEnergy : monthlyReport.totalEnergy} kWh
          </p>
          {viewMode === 'monthly' && (
            <p className="stat-subtitle">Avg: {monthlyReport.avgDailyEnergy} kWh/day</p>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌱</div>
          <h3>{viewMode === 'daily' ? 'Total Emissions Offset' : 'Monthly Emissions Offset'}</h3>
          <p className="stat-value">
            {viewMode === 'daily' ? report.totalEmissions : monthlyReport.totalEmissions} kg CO2
          </p>
          {viewMode === 'monthly' && (
            <p className="stat-subtitle">Avg: {monthlyReport.avgDailyEmissions} kg CO2/day</p>
          )}
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <h3>{viewMode === 'daily' ? 'Total Logs' : 'Monthly Logs'}</h3>
          <p className="stat-value">
            {viewMode === 'daily' ? (report.totalLogs || 0) : (monthlyReport.totalLogs || 0)}
          </p>
          {viewMode === 'monthly' && (
            <p className="stat-subtitle">Avg: {monthlyReport.avgDailyLogs} logs/day</p>
          )}
        </div>
      </div>
      
      {(viewMode === 'daily' ? report.dailyWeights.length === 0 : monthlyReport.dailyWeights.length === 0) ? (
        <div className="no-data-state">
          <p>No waste logs available for {viewMode === 'daily' ? 'today' : `${monthlyReport.monthName} ${monthlyReport.year}`}.</p>
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
        <h3>AI Recommendation</h3>
        <div className="ai-inputs">
          <div className="row">
            <label>Paper %</label>
            <input type="number" value={waste.paper_pct} onChange={(e) => setWaste({ ...waste, paper_pct: Number(e.target.value) })} />
            <label>Plastic %</label>
            <input type="number" value={waste.plastic_pct} onChange={(e) => setWaste({ ...waste, plastic_pct: Number(e.target.value) })} />
            <label>Organic %</label>
            <input type="number" value={waste.organic_pct} onChange={(e) => setWaste({ ...waste, organic_pct: Number(e.target.value) })} />
            <label>Moisture %</label>
            <input type="number" value={waste.moisture_pct} onChange={(e) => setWaste({ ...waste, moisture_pct: Number(e.target.value) })} />
          </div>
          <small>Ensure the four percentages sum to ~100.</small>
        </div>
        <div className="ai-actions">
          <button disabled={recoLoading} onClick={handleRecommend} className="recommend-button">
            {recoLoading ? 'Calculating...' : 'Recommend Settings'}
          </button>
        </div>
        {recoError && <p className="error-message">{recoError}</p>}
        {reco && (
          <div className="reco-result">
            <h4>Recommended Settings</h4>
            <pre>{JSON.stringify(reco.settings, null, 2)}</pre>
            <p>Predicted Energy: <b>{reco.pred_energy?.toFixed ? reco.pred_energy.toFixed(2) : reco.pred_energy}</b></p>
            <p>Predicted Emissions: <b>{reco.pred_emissions?.toFixed ? reco.pred_emissions.toFixed(2) : reco.pred_emissions}</b></p>
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