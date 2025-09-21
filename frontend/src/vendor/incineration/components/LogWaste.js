import React, { useState, useEffect } from 'react';
import api from '../apiClient';
import { useParams, useNavigate } from 'react-router-dom';
import './LogWaste.css';

function LogWaste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    weight: '',
    category: '',
    location: '',
    status: 'pending',
    emissions: 0,
    energyProduced: 0,
    composition: { plastics: 0, organics: 0, metals: 0, glass: 0, paper: 0 },
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [compositionError, setCompositionError] = useState('');
  const [reco, setReco] = useState(null);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState('');
  const [showRecoModal, setShowRecoModal] = useState(false);
  const [acceptingReco, setAcceptingReco] = useState(false);
  const [modalCompositionTotal, setModalCompositionTotal] = useState(0);
  const [isAiRecommendationFlow, setIsAiRecommendationFlow] = useState(false);

  const compositionTotal = Object.values(formData.composition || {}).reduce((s, v) => s + (Number(v) || 0), 0);

  const normalizeComposition = () => {
    const entries = Object.entries(formData.composition || {});
    const sum = entries.reduce((s, [, v]) => s + (Number(v) || 0), 0);
    if (sum === 0) {
      setCompositionError('Nothing to normalize. Enter some values first.');
      return;
    }
    
    // Calculate normalized values
    const normalized = Object.fromEntries(entries.map(([k, v]) => [k, Math.round(((Number(v) || 0) / sum) * 100)]));
    
    // Ensure the total is exactly 100 by adjusting the largest value
    const normalizedTotal = Object.values(normalized).reduce((s, v) => s + (Number(v) || 0), 0);
    if (normalizedTotal !== 100) {
      const diff = 100 - normalizedTotal;
      const keys = Object.keys(normalized);
      if (keys.length > 0) {
        // Find the largest value and adjust it
        const largestKey = keys.reduce((a, b) => normalized[a] > normalized[b] ? a : b);
        normalized[largestKey] = normalized[largestKey] + diff;
      }
    }
    
    setFormData({ ...formData, composition: normalized });
    setCompositionError('');
    
    // Update modal composition total
    const newTotal = Object.values(normalized).reduce((s, v) => s + (Number(v) || 0), 0);
    setModalCompositionTotal(newTotal);
    
    console.log('Normalized composition:', normalized);
    console.log('Normalized total:', newTotal);
  };

  useEffect(() => {
    if (id) {
      fetchLog(id);
    }
  }, [id]);

  // Update modal composition total when form data changes
  useEffect(() => {
    if (showRecoModal) {
      const newTotal = Object.values(formData.composition || {}).reduce((s, v) => s + (Number(v) || 0), 0);
      setModalCompositionTotal(newTotal);
    }
  }, [formData.composition, showRecoModal]);

  const fetchLog = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/waste/logs/${id}`);
      const { composition = {}, ...logData } = res.data;
      setFormData({
        ...logData,
        composition: {
          plastics: composition.plastics || 0,
          organics: composition.organics || 0,
          metals: composition.metals || 0,
          glass: composition.glass || 0,
          paper: composition.paper || 0,
        },
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching log');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.weight <= 0) {
      setError('Weight must be a positive number.');
      return;
    }
    if (compositionTotal !== 0 && Math.round(compositionTotal) !== 100) {
      setCompositionError('Composition percentages must sum to 100%.');
      return;
    }
    setCompositionError('');
    setError('');
    setLoading(true);
    try {
      const payload = { ...formData };
      if (id) {
        await api.put(`/api/waste/logs/${id}`, payload);
        alert('Log updated successfully!');
      } else {
        await api.post('/api/waste/log', payload);
        alert('Waste log saved successfully!');
      }

      // After successful save, fetch AI recommendation (non-blocking on failure)
      try {
        const comp = payload.composition || {};
        const paper = Number(comp.paper) || 0;
        const plastic = Number(comp.plastics) || Number(comp.plastic) || 0;
        const organic = Number(comp.organics) || Number(comp.organic) || 0;
        let moisture = 100 - (paper + plastic + organic);
        if (!Number.isFinite(moisture)) moisture = 0;
        moisture = Math.max(0, Math.min(100, Math.round(moisture)));

        const waste = {
          paper_pct: Math.max(0, Math.min(100, Math.round(paper))),
          plastic_pct: Math.max(0, Math.min(100, Math.round(plastic))),
          organic_pct: Math.max(0, Math.min(100, Math.round(organic))),
          moisture_pct: moisture,
        };
        const constraints = {
          airflow_min: 200, airflow_max: 600,
          grate_speed_min: 0.5, grate_speed_max: 2.0,
          feed_rate_min: 3, feed_rate_max: 9,
          o2_target_min: 3, o2_target_max: 9,
          burner_temp_min: 750, burner_temp_max: 1000,
          emissions_cap: 200,
        };
        const recoRes = await api.post('/api/waste/recommend', { waste, constraints, lambda_penalty: 0.5, n_samples: 400 });
        if (recoRes?.data?.settings) {
          const s = recoRes.data.settings;
          alert(
            `AI Recommended Settings:\n` +
            `- Airflow: ${Number(s.airflow).toFixed(1)}\n` +
            `- Grate Speed: ${Number(s.grate_speed).toFixed(2)}\n` +
            `- Feed Rate: ${Number(s.feed_rate).toFixed(2)}\n` +
            `- O2 Target: ${Number(s.o2_target).toFixed(2)}\n` +
            `- Burner Temp: ${Number(s.burner_temp).toFixed(0)}°C\n` +
            `Pred Energy: ${Number(recoRes.data.pred_energy).toFixed(2)} | ` +
            `Pred Emissions: ${Number(recoRes.data.pred_emissions).toFixed(2)}`
          );
        }
      } catch (aiErr) {
        console.warn('AI recommendation failed:', aiErr);
      }

      // Trigger AI recommendation and display in a modal
      try {
        setReco(null);
        setRecoError('');
        setRecoLoading(true);
        const comp = payload.composition || {};
        const paper = Number(comp.paper) || 0;
        const plastic = Number(comp.plastics) || Number(comp.plastic) || 0;
        const organic = Number(comp.organics) || Number(comp.organic) || 0;
        const metals = Number(comp.metals) || 0;
        const glass = Number(comp.glass) || 0;
        const totalPct = paper + plastic + organic + metals + glass;
        let moisture = totalPct > 0 ? Math.max(0, 100 - (paper + plastic + organic + metals + glass)) : 15;
        if (!Number.isFinite(moisture)) moisture = 0;
        moisture = Math.max(0, Math.min(100, Math.round(moisture)));

        const waste = {
          paper_pct: Math.max(0, Math.min(100, Math.round(paper))),
          plastic_pct: Math.max(0, Math.min(100, Math.round(plastic))),
          organic_pct: Math.max(0, Math.min(100, Math.round(organic))),
          moisture_pct: moisture,
        };
        const constraints = {
          airflow_min: 200, airflow_max: 600,
          grate_speed_min: 0.5, grate_speed_max: 2.0,
          feed_rate_min: 3, feed_rate_max: 9,
          o2_target_min: 3, o2_target_max: 9,
          burner_temp_min: 750, burner_temp_max: 1000,
          emissions_cap: 200,
        };
        const { data } = await api.post('/api/waste/recommend', { waste, constraints, lambda_penalty: 0.5, n_samples: 800 });
        setReco(data);
        setShowRecoModal(true);
        setIsAiRecommendationFlow(true);
        // Initialize modal composition total
        setModalCompositionTotal(compositionTotal);
      } catch (aiErr) {
        const detail = aiErr.response?.data?.detail || aiErr.response?.data?.error || aiErr.message || 'AI service error';
        setRecoError(typeof detail === 'string' ? detail : JSON.stringify(detail));
        setShowRecoModal(true);
      } finally {
        setRecoLoading(false);
      }

      // Don't reset form during AI recommendation flow
      // The form will be reset after AI recommendation is accepted or modal is closed
      // Stay on page to show recommendation
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save/update log. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRecommendation = async () => {
    if (!reco) return;
    
    setAcceptingReco(true);
    setError(''); // Clear any existing errors
    setCompositionError(''); // Clear composition errors
    
    try {
      // Validate composition before saving - use the current form data composition
      const currentComposition = formData.composition || {};
      const currentCompositionTotal = Object.values(currentComposition).reduce((sum, val) => sum + (Number(val) || 0), 0);
      
      console.log('Current composition for validation:', currentComposition);
      console.log('Current composition total:', currentCompositionTotal);
      
      if (currentCompositionTotal > 0 && currentCompositionTotal !== 100) {
        setCompositionError('Composition percentages must sum to 100%. Please adjust the composition or use the normalize button.');
        setAcceptingReco(false);
        return;
      }
      
      // Update form data with AI predicted values
      const updatedFormData = {
        ...formData,
        emissions: Number(reco.pred_emissions),
        energyProduced: Number(reco.pred_energy),
        aiRecommendation: {
          settings: reco.settings,
          pred_energy: Number(reco.pred_energy),
          pred_emissions: Number(reco.pred_emissions),
          accepted: true,
          acceptedAt: new Date().toISOString()
        }
      };
      
      // Save the log with AI predictions
      const payload = { ...updatedFormData };
      console.log('Saving with AI recommendations:', payload);
      console.log('Payload composition:', payload.composition);
      console.log('Payload composition total:', Object.values(payload.composition || {}).reduce((sum, val) => sum + (Number(val) || 0), 0));
      
      if (id) {
        await api.put(`/api/waste/logs/${id}`, payload);
        alert('Log updated with AI recommendations!');
      } else {
        await api.post('/api/waste/log', payload);
        alert('Waste log saved with AI recommendations!');
      }
      
      // Close modal and reset recommendation state
      setShowRecoModal(false);
      setReco(null);
      setRecoError('');
      setIsAiRecommendationFlow(false);
      
      // Reset form after successful AI recommendation acceptance
      setFormData({
        weight: '',
        category: '',
        location: '',
        status: 'pending',
        emissions: 0,
        energyProduced: 0,
        composition: { plastics: 0, organics: 0, metals: 0, glass: 0, paper: 0 },
      });
      
      // Navigate to existing logs to show the updated data
      navigate('/existing-logs');
      
    } catch (err) {
      console.error('Error saving with AI recommendations:', err);
      setError(err.response?.data?.message || 'Failed to save with AI recommendations');
    } finally {
      setAcceptingReco(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await api.get('/api/waste/reports/daily/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'daily_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || 'Error downloading CSV');
    }
  };

  return (
    <div className="log-waste">
      <div className="page-header">
        <h2>{id ? 'Edit Waste Log' : 'Log Waste'}</h2>
        <p className="form-description">
          Enter waste details below. This information will be used for tracking and reporting purposes.
        </p>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <div className="alert alert-info">Loading...</div>}
      
      <form onSubmit={handleSubmit} className="waste-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="weight">Waste Weight (kg) *</label>
              <input
                id="weight"
                type="number"
                placeholder="Enter weight in kilograms"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || '' })}
                required
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Waste Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                <option value="perishable">Perishable</option>
                <option value="non-perishable">Non-Perishable</option>
                <option value="hazardous">Hazardous</option>
                <option value="recyclable">Recyclable</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Processing Location *</label>
              <select
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              >
                <option value="">Select location</option>
                <option value="Site A">Site A</option>
                <option value="Site B">Site B</option>
                <option value="Site C">Site C</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Processing Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Processing Results</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emissions">CO2 Emissions (kg)</label>
              <input
                id="emissions"
                type="number"
                placeholder="Enter emissions in kg CO2"
                value={formData.emissions}
                onChange={(e) => setFormData({ ...formData, emissions: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="energyProduced">Energy Produced (kWh)</label>
              <input
                id="energyProduced"
                type="number"
                placeholder="Enter energy produced in kWh"
                value={formData.energyProduced}
                onChange={(e) => setFormData({ ...formData, energyProduced: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Waste Composition</h3>
          <div className="composition-group">
            <div className="composition-header">
              <label>Composition (% by weight)</label>
              <p className="helper-text">Optional: enter percentages that sum to 100.</p>
            </div>
            
            <div className="composition-total-row">
              <div className={`total-pill ${compositionTotal === 100 ? 'ok' : compositionTotal === 0 ? 'zero' : 'warn'}`}>
                Total: {compositionTotal}%
              </div>
              <div className="total-bar">
                <div className={`total-bar-fill ${compositionTotal === 100 ? 'ok' : 'warn'}`} style={{ width: `${Math.min(compositionTotal, 100)}%` }} />
              </div>
            </div>
            
            <div className="composition-grid">
              {Object.keys(formData.composition).map((key) => (
                <div className="composition-item" key={key}>
                  <label htmlFor={`comp-${key}`}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <div className="input-with-adornment">
                    <input
                      id={`comp-${key}`}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.composition[key]}
                      onChange={(e) => setFormData({
                        ...formData,
                        composition: {
                          ...formData.composition,
                          [key]: Number(e.target.value) || 0,
                        },
                      })}
                    />
                    <span className="adornment">%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="composition-actions">
              <button type="button" className="chip" onClick={() => setFormData({
                ...formData,
                composition: { plastics: 30, organics: 40, metals: 10, glass: 10, paper: 10 },
              })}>Common municipal</button>
              <button type="button" className="chip" onClick={() => setFormData({
                ...formData,
                composition: { plastics: 10, organics: 60, metals: 5, glass: 5, paper: 20 },
              })}>Organics-heavy</button>
              <button type="button" className="chip" onClick={() => setFormData({
                ...formData,
                composition: { plastics: 50, organics: 10, metals: 20, glass: 10, paper: 10 },
              })}>Industrial mix</button>
              <button type="button" className="chip" onClick={() => setFormData({
                ...formData,
                composition: { plastics: 0, organics: 0, metals: 0, glass: 0, paper: 0 },
              })}>Clear</button>
              <button type="button" className="chip primary" onClick={normalizeComposition}>Normalize to 100%</button>
            </div>
            {compositionError && <div className="alert alert-error">{compositionError}</div>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="submit-btn">
            {id ? 'Update Log' : 'Submit Waste Log'}
          </button>
          <button type="button" onClick={() => navigate('/existing-logs')} className="secondary-btn">
            View All Logs
          </button>
        </div>
      </form>

      {(recoLoading || reco || recoError) && showRecoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>AI Recommendation</h3>
            {recoLoading && <p className="loading-message">Calculating best settings...</p>}
            {recoError && <p className="error-message">{recoError}</p>}
            {compositionError && <p className="error-message">{compositionError}</p>}
            {reco && (
              <div className="reco-card">
                <div className="reco-grid">
                  <div><strong>Airflow</strong><div>{Number(reco.settings?.airflow).toFixed(1)}</div></div>
                  <div><strong>Grate Speed</strong><div>{Number(reco.settings?.grate_speed).toFixed(2)}</div></div>
                  <div><strong>Feed Rate</strong><div>{Number(reco.settings?.feed_rate).toFixed(2)}</div></div>
                  <div><strong>O2 Target</strong><div>{Number(reco.settings?.o2_target).toFixed(2)}</div></div>
                  <div><strong>Burner Temp</strong><div>{Number(reco.settings?.burner_temp).toFixed(0)}°C</div></div>
                </div>
                <p>Predicted Energy: <b>{Number(reco.pred_energy).toFixed(2)}</b></p>
                <p>Predicted Emissions: <b>{Number(reco.pred_emissions).toFixed(2)}</b></p>
                
                {/* Composition validation in modal */}
                <div className="composition-validation">
                  <div className="composition-total-row">
                    <div className={`total-pill ${modalCompositionTotal === 100 ? 'ok' : modalCompositionTotal === 0 ? 'zero' : 'warn'}`}>
                      Total: {modalCompositionTotal}%
                    </div>
                    <div className="total-bar">
                      <div className={`total-bar-fill ${modalCompositionTotal === 100 ? 'ok' : 'warn'}`} style={{ width: `${Math.min(modalCompositionTotal, 100)}%` }} />
                    </div>
                  </div>
                  {modalCompositionTotal > 0 && modalCompositionTotal !== 100 && (
                    <div className="composition-warning">
                      <p>⚠️ Composition percentages must sum to 100% to accept recommendation</p>
                      <button 
                        type="button" 
                        className="chip primary" 
                        onClick={() => {
                          normalizeComposition();
                          setCompositionError('');
                        }}
                      >
                        Normalize to 100%
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button 
                type="button" 
                className="accept-btn" 
                onClick={handleAcceptRecommendation}
                disabled={acceptingReco || (modalCompositionTotal > 0 && modalCompositionTotal !== 100)}
              >
                {acceptingReco ? 'Accepting...' : '✅ Accept Recommendation'}
              </button>
              <button 
                type="button" 
                className="secondary-btn" 
                onClick={() => {
                  setShowRecoModal(false);
                  setReco(null);
                  setRecoError('');
                  setIsAiRecommendationFlow(false);
                }}
              >
                Close
              </button>
              <button type="button" className="secondary-btn" onClick={() => navigate('/reports')}>View Reports</button>
            </div>
          </div>
        </div>
      )}

      <div className="download-section">
        <button onClick={downloadCSV} className="download-btn" disabled={loading}>
          Download Daily CSV Report
        </button>
      </div>
    </div>
  );
}

export default LogWaste;