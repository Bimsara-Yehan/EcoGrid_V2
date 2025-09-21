const express = require('express');
const router = express.Router();
const WasteLog = require('../models/WasteLog');
const { Parser } = require('json2csv'); // Requires `npm install json2csv`
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendSuccess, sendError, sendValidationError, sendNotFoundError } = require('../utils/response');

// Validate composition: map of material -> percentage (0-100), sums to 100 when provided
function validateComposition(composition) {
  if (!composition) return { ok: true };
  if (typeof composition !== 'object') {
    return { ok: false, message: 'composition must be an object/map' };
  }
  const entries = Object.entries(composition);
  if (entries.length === 0) return { ok: true };
  let sum = 0;
  for (const [key, value] of entries) {
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0 || num > 100) {
      return { ok: false, message: `composition.${key} must be a number between 0 and 100` };
    }
    sum += num;
  }
  if (Math.round(sum) !== 100) {
    return { ok: false, message: 'composition percentages must sum to 100' };
  }
  return { ok: true };
}

// GET all logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await WasteLog.find();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a log by ID
router.get('/logs/:id', async (req, res) => {
  try {
    const log = await WasteLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST a new log
router.post('/log', async (req, res) => {
  try {
    console.log('Received log data:', JSON.stringify(req.body, null, 2));
    const { composition, aiRecommendation } = req.body || {};
    console.log('Composition:', composition);
    console.log('AI Recommendation:', aiRecommendation);
    
    const validation = validateComposition(composition);
    if (!validation.ok) {
      console.log('Composition validation failed:', validation.message);
      return res.status(400).json({ message: validation.message });
    }
    const log = new WasteLog(req.body);
    await log.save();
    console.log('Log saved successfully:', log._id);
    console.log('Saved AI recommendation:', log.aiRecommendation);
    res.status(201).json(log);
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT (update) a log by ID
router.put('/logs/:id', async (req, res) => {
  try {
    const { composition } = req.body || {};
    const validation = validateComposition(composition);
    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }
    const log = await WasteLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json(log);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE a log by ID
router.delete('/logs/:id', async (req, res) => {
  try {
    const log = await WasteLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET comprehensive report (all historical data)
router.get('/reports/daily', async (req, res) => {
  try {
    // Get all logs, sorted by date
    const logs = await WasteLog.find().sort({ date: 1 });
    
    // Debug: Check for logs with AI recommendations
    const logsWithAI = await WasteLog.find({ 'aiRecommendation': { $exists: true } });
    console.log('Logs with AI recommendations:', logsWithAI.length);
    console.log('Sample AI log:', logsWithAI[0]);

    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No waste logs found' });
    }

    // Group logs by date for better chart visualization
    const logsByDate = {};
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!logsByDate[dateKey]) {
        logsByDate[dateKey] = {
          weight: 0,
          energy: 0,
          emissions: 0,
          count: 0
        };
      }
      // Only add weight if it's a valid number
      if (log.weight && log.weight > 0) {
        logsByDate[dateKey].weight += log.weight;
      }
      logsByDate[dateKey].energy += (log.energyProduced || 0);
      logsByDate[dateKey].emissions += (log.emissions || 0);
      logsByDate[dateKey].count += 1;
    });

    // Convert to arrays for chart data
    const dates = Object.keys(logsByDate).sort();
    const dailyWeights = dates.map(date => logsByDate[date].weight);
    const dailyEnergy = dates.map(date => logsByDate[date].energy);
    const dailyEmissions = dates.map(date => logsByDate[date].emissions);

    // Calculate totals - filter out logs with empty weight (AI recommendation logs)
    const validLogs = logs.filter(log => log.weight && log.weight > 0);
    const totalWeight = validLogs.reduce((sum, log) => sum + log.weight, 0);
    const totalEnergy = validLogs.reduce((sum, log) => sum + (log.energyProduced || 0), 0);
    const totalEmissions = validLogs.reduce((sum, log) => sum + (log.emissions || 0), 0);
    
    // For total logs count, we want to count all logs, not just valid ones
    const totalLogsCount = logs.length;
    
    console.log('=== REPORTS DEBUG ===');
    console.log('All logs:', logs.length);
    console.log('Valid logs (with weight > 0):', validLogs.length);
    console.log('Total logs count (for display):', totalLogsCount);
    console.log('Total weight:', totalWeight);
    console.log('Total energy:', totalEnergy);
    console.log('Total emissions:', totalEmissions);
    
    // Debug: Show sample logs
    console.log('Sample logs:', logs.slice(0, 3).map(log => ({
      id: log._id,
      weight: log.weight,
      category: log.category,
      energyProduced: log.energyProduced,
      emissions: log.emissions,
      hasAI: !!log.aiRecommendation
    })));
    console.log('=== END REPORTS DEBUG ===');

    // Calculate AI statistics
    const aiLogs = logs.filter(log => log.aiRecommendation);
    const acceptedLogs = aiLogs.filter(log => log.aiRecommendation && log.aiRecommendation.accepted);
    
    console.log('Total logs:', logs.length);
    console.log('AI logs:', aiLogs.length);
    console.log('Accepted logs:', acceptedLogs.length);
    console.log('Accepted logs details:', acceptedLogs.map(log => ({
      id: log._id,
      aiRecommendation: log.aiRecommendation
    })));
    
    const avgPredictedEnergy = acceptedLogs.length > 0 
      ? acceptedLogs.reduce((sum, log) => sum + (log.aiRecommendation.pred_energy || 0), 0) / acceptedLogs.length 
      : 0;
    const avgPredictedEmissions = acceptedLogs.length > 0 
      ? acceptedLogs.reduce((sum, log) => sum + (log.aiRecommendation.pred_emissions || 0), 0) / acceptedLogs.length 
      : 0;
    
    console.log('Avg predicted energy:', avgPredictedEnergy);
    console.log('Avg predicted emissions:', avgPredictedEmissions);

    res.json({
      totalWeight,
      totalEnergy,
      totalEmissions,
      dailyWeights,
      dailyEnergy,
      dailyEmissions,
      dates,
      totalLogs: totalLogsCount,
      aiStats: {
        totalAccepted: acceptedLogs.length,
        totalRecommendations: aiLogs.length,
        avgPredictedEnergy: Math.round(avgPredictedEnergy * 100) / 100,
        avgPredictedEmissions: Math.round(avgPredictedEmissions * 100) / 100
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET monthly analytics
router.get('/reports/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Default to current month if no parameters provided
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth(); // month is 0-indexed
    
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    
    console.log(`Fetching monthly data for ${targetYear}-${targetMonth + 1}`);
    console.log(`Date range: ${startOfMonth.toISOString()} to ${endOfMonth.toISOString()}`);
    
    const logs = await WasteLog.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    
    console.log(`Found ${logs.length} logs for the month`);
    
    // Calculate monthly totals
    const totalWeight = logs.reduce((sum, log) => sum + (log.weight || 0), 0);
    const totalEnergy = logs.reduce((sum, log) => sum + (log.energyProduced || 0), 0);
    const totalEmissions = logs.reduce((sum, log) => sum + (log.emissions || 0), 0);
    const totalLogsCount = logs.length;
    
    // Calculate daily breakdown for the month
    const dailyData = {};
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          weight: 0,
          energy: 0,
          emissions: 0,
          logs: 0
        };
      }
      dailyData[dateKey].weight += log.weight || 0;
      dailyData[dateKey].energy += log.energyProduced || 0;
      dailyData[dateKey].emissions += log.emissions || 0;
      dailyData[dateKey].logs += 1;
    });
    
    // Convert to arrays for charting
    const dates = Object.keys(dailyData).sort();
    const dailyWeights = dates.map(date => dailyData[date].weight);
    const dailyEnergy = dates.map(date => dailyData[date].energy);
    const dailyEmissions = dates.map(date => dailyData[date].emissions);
    const dailyLogs = dates.map(date => dailyData[date].logs);
    
    // Calculate averages
    const avgDailyWeight = totalWeight / Math.max(dates.length, 1);
    const avgDailyEnergy = totalEnergy / Math.max(dates.length, 1);
    const avgDailyEmissions = totalEmissions / Math.max(dates.length, 1);
    const avgDailyLogs = totalLogsCount / Math.max(dates.length, 1);
    
    // Calculate weekly breakdown
    const weeklyData = {};
    dates.forEach(date => {
      const dateObj = new Date(date);
      const weekStart = new Date(dateObj);
      weekStart.setDate(dateObj.getDate() - dateObj.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weight: 0,
          energy: 0,
          emissions: 0,
          logs: 0
        };
      }
      weeklyData[weekKey].weight += dailyData[date].weight;
      weeklyData[weekKey].energy += dailyData[date].energy;
      weeklyData[weekKey].emissions += dailyData[date].emissions;
      weeklyData[weekKey].logs += dailyData[date].logs;
    });
    
    const weekDates = Object.keys(weeklyData).sort();
    const weeklyWeights = weekDates.map(date => weeklyData[date].weight);
    const weeklyEnergy = weekDates.map(date => weeklyData[date].energy);
    const weeklyEmissions = weekDates.map(date => weeklyData[date].emissions);
    const weeklyLogs = weekDates.map(date => weeklyData[date].logs);
    
    // AI statistics
    const aiLogs = logs.filter(log => log.ai_recommendation_accepted);
    const acceptedLogs = logs.filter(log => log.ai_recommendation_accepted === true);
    const avgPredictedEnergy = aiLogs.length > 0 
      ? aiLogs.reduce((sum, log) => sum + (log.ai_predicted_energy || 0), 0) / aiLogs.length 
      : 0;
    const avgPredictedEmissions = aiLogs.length > 0 
      ? aiLogs.reduce((sum, log) => sum + (log.ai_predicted_emissions || 0), 0) / aiLogs.length 
      : 0;
    
    console.log('Monthly totals:', { totalWeight, totalEnergy, totalEmissions, totalLogsCount });
    console.log('Daily averages:', { avgDailyWeight, avgDailyEnergy, avgDailyEmissions, avgDailyLogs });
    
    res.json({
      // Monthly totals
      totalWeight,
      totalEnergy,
      totalEmissions,
      totalLogs: totalLogsCount,
      
      // Monthly averages
      avgDailyWeight: Math.round(avgDailyWeight * 100) / 100,
      avgDailyEnergy: Math.round(avgDailyEnergy * 100) / 100,
      avgDailyEmissions: Math.round(avgDailyEmissions * 100) / 100,
      avgDailyLogs: Math.round(avgDailyLogs * 100) / 100,
      
      // Daily breakdown
      dailyWeights,
      dailyEnergy,
      dailyEmissions,
      dailyLogs,
      dates,
      
      // Weekly breakdown
      weeklyWeights,
      weeklyEnergy,
      weeklyEmissions,
      weeklyLogs,
      weekDates,
      
      // AI statistics
      aiStats: {
        totalAccepted: acceptedLogs.length,
        totalRecommendations: aiLogs.length,
        avgPredictedEnergy: Math.round(avgPredictedEnergy * 100) / 100,
        avgPredictedEmissions: Math.round(avgPredictedEmissions * 100) / 100
      },
      
      // Month info
      month: targetMonth + 1,
      year: targetYear,
      monthName: startOfMonth.toLocaleString('default', { month: 'long' })
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET dailyDC report as CSV
router.get('/reports/daily/csv', async (req, res) => {
  try {
    const { date } = req.query;
    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await WasteLog.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const csvFields = [
      'date', 'weight', 'category', 'location', 'status', 
      'energyProduced', 'emissions', 'composition',
      'ai_recommendation_accepted', 'ai_predicted_energy', 'ai_predicted_emissions',
      'ai_airflow', 'ai_grate_speed', 'ai_feed_rate', 'ai_o2_target', 'ai_burner_temp',
      'ai_accepted_at'
    ];
    const csvData = logs.map(log => ({
      date: log.date.toISOString().split('T')[0],
      weight: log.weight,
      category: log.category,
      location: log.location,
      status: log.status,
      energyProduced: log.energyProduced || 0,
      emissions: log.emissions || 0,
      composition: log.composition ? JSON.stringify(Object.fromEntries(log.composition)) : '{}',
      ai_recommendation_accepted: log.aiRecommendation?.accepted || false,
      ai_predicted_energy: log.aiRecommendation?.pred_energy || '',
      ai_predicted_emissions: log.aiRecommendation?.pred_emissions || '',
      ai_airflow: log.aiRecommendation?.settings?.airflow || '',
      ai_grate_speed: log.aiRecommendation?.settings?.grate_speed || '',
      ai_feed_rate: log.aiRecommendation?.settings?.feed_rate || '',
      ai_o2_target: log.aiRecommendation?.settings?.o2_target || '',
      ai_burner_temp: log.aiRecommendation?.settings?.burner_temp || '',
      ai_accepted_at: log.aiRecommendation?.acceptedAt ? log.aiRecommendation.acceptedAt.toISOString() : ''
    }));

    const parser = new Parser({ fields: csvFields });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('daily_report.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

// Export logs to CSV for AI training
router.get('/export/csv', async (req, res) => {
  try {
    const logs = await WasteLog.find().sort({ date: 1 });
    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: 'No logs to export' });
    }

    // Map composition to known features; default missing to 0
    const toPct = (comp, key) => {
      if (!comp) return 0;
      const val = comp.get ? comp.get(key) : comp[key];
      const num = Number(val);
      return Number.isFinite(num) ? num : 0;
    };

    const rows = logs.map(log => {
      const composition = log.composition ? (log.composition instanceof Map ? Object.fromEntries(log.composition) : log.composition) : {};
      // Support both singular and plural keys from composition
      const paper = toPct(composition, 'paper');
      const plastic = toPct(composition, 'plastic') || toPct(composition, 'plastics');
      const organic = toPct(composition, 'organic') || toPct(composition, 'organics');
      const moisture = toPct(composition, 'moisture');
      return {
        timestamp: log.date ? log.date.toISOString() : '',
        paper_pct: paper,
        plastic_pct: plastic,
        organic_pct: organic,
        moisture_pct: moisture,
        airflow: Number(log.raw?.airflow ?? log.raw?.settings?.airflow ?? 0),
        grate_speed: Number(log.raw?.grate_speed ?? log.raw?.settings?.grate_speed ?? 0),
        feed_rate: Number(log.raw?.feed_rate ?? log.raw?.settings?.feed_rate ?? 0),
        o2_target: Number(log.raw?.o2_target ?? log.raw?.settings?.o2_target ?? 0),
        burner_temp: Number(log.raw?.burner_temp ?? log.raw?.settings?.burner_temp ?? 0),
        energy_output: Number(log.energyProduced ?? 0),
        emissions_index: Number(log.emissions ?? 0),
      };
    });

    const fields = ['timestamp','paper_pct','plastic_pct','organic_pct','moisture_pct','airflow','grate_speed','feed_rate','o2_target','burner_temp','energy_output','emissions_index'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rows);

    const root = path.resolve(__dirname, '..', '..');
    const outDir = path.join(root, 'ai-service', 'data');
    const outPath = path.join(outDir, 'waste_logs.csv');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, csv, 'utf8');

    return res.json({ message: 'Exported', path: outPath, count: rows.length });
  } catch (error) {
    console.error('Export failed:', error);
    return res.status(500).json({ message: 'Export failed', error: error.message });
  }
});

// Proxy to AI recommendation service
router.post('/recommend', async (req, res) => {
  try {
    const aiBaseUrl = process.env.PY_AI_BASE_URL || 'http://127.0.0.1:8010';
    const apiKey = process.env.PY_AI_API_KEY || 'changeme';
    const client = axios.create({ baseURL: aiBaseUrl, timeout: 15000, headers: { 'x-api-key': apiKey } });

    const { data } = await client.post('/recommend', req.body);
    res.json(data);
  } catch (error) {
    const status = error.response?.status || 502;
    const detail = error.response?.data || { message: error.message };
    const target = (process.env.PY_AI_BASE_URL || 'http://127.0.0.1:8010') + '/recommend';
    res.status(status).json({ error: 'AI service error', target, detail });
  }
});