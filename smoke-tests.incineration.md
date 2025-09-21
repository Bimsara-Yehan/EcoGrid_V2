# Smoke Tests for Incineration Subsystem

## Prerequisites
- Backend server running on http://localhost:5000
- MongoDB Atlas staging database connected
- AI service running on http://localhost:8000 (required for AI features)

## AI Service Setup
```bash
# Navigate to AI service directory
cd backend/vendor/incineration/ai-service

# Install Python dependencies
pip install -r requirements.txt

# Start AI service
uvicorn app:app --host 0.0.0.0 --port 8000
```

## Test Endpoints

### 1. Health Check
```bash
curl -X GET http://localhost:5000/health
```
**Expected Response:**
```json
{
  "ok": true,
  "mongoState": 1
}
```

### 2. Get All Waste Logs
```bash
curl -X GET http://localhost:5000/api/waste/logs
```
**Expected Response:**
```json
{
  "success": true,
  "data": [],
  "message": null
}
```

### 3. Create New Waste Log
```bash
curl -X POST http://localhost:5000/api/waste/logs \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 100,
    "category": "municipal",
    "location": "Test Facility",
    "composition": {
      "paper_pct": 30,
      "plastic_pct": 20,
      "organic_pct": 40,
      "moisture_pct": 10
    }
  }'
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "weight": 100,
    "category": "municipal",
    "location": "Test Facility",
    "composition": {
      "paper_pct": 30,
      "plastic_pct": 20,
      "organic_pct": 40,
      "moisture_pct": 10
    },
    "energyProduced": 0,
    "emissions": 0,
    "status": "pending",
    "date": "2024-01-01T00:00:00.000Z"
  },
  "message": "Waste log created successfully"
}
```

### 4. Get Daily Reports
```bash
curl -X GET http://localhost:5000/api/waste/reports/daily
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalWeight": 100,
    "totalEnergy": 0,
    "totalEmissions": 0,
    "totalLogs": 1,
    "dailyWeights": [100],
    "dailyEnergy": [0],
    "dailyEmissions": [0],
    "dates": ["2024-01-01"]
  }
}
```

### 5. Get Monthly Reports
```bash
curl -X GET http://localhost:5000/api/waste/reports/monthly
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalWeight": 100,
    "totalEnergy": 0,
    "totalEmissions": 0,
    "totalLogs": 1,
    "avgDailyWeight": 100,
    "avgDailyEnergy": 0,
    "avgDailyEmissions": 0,
    "avgDailyLogs": 1,
    "month": 1,
    "year": 2024,
    "monthName": "January"
  }
}
```

### 6. AI Service Health Check
```bash
curl -X GET http://localhost:8000/health
```
**Expected Response:**
```json
{
  "status": "healthy",
  "mobile_optimized": true,
  "cors_enabled": true
}
```

### 7. Get AI Recommendation
```bash
curl -X POST http://localhost:5000/api/waste/ai/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "paper_pct": 30,
    "plastic_pct": 20,
    "organic_pct": 40,
    "moisture_pct": 10
  }'
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "predicted_energy": 150.5,
    "predicted_emissions": 25.3,
    "recommended_settings": {
      "airflow": 300,
      "grate_speed": 2.5,
      "feed_rate": 1.8,
      "o2_target": 15,
      "burner_temp": 850
    }
  }
}
```

### 7. Export Daily Report (CSV)
```bash
curl -X GET http://localhost:5000/api/waste/reports/daily/csv
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "message": "Exported",
    "path": "/path/to/export.csv",
    "count": 1
  }
}
```

## Error Cases

### 1. Invalid Composition
```bash
curl -X POST http://localhost:5000/api/waste/logs \
  -H "Content-Type: application/json" \
  -d '{
    "weight": 100,
    "category": "municipal",
    "location": "Test Facility",
    "composition": {
      "paper_pct": 30,
      "plastic_pct": 20,
      "organic_pct": 40,
      "moisture_pct": 20
    }
  }'
```
**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "composition percentages must sum to 100",
    "details": null
  }
}
```

### 2. Log Not Found
```bash
curl -X GET http://localhost:5000/api/waste/logs/invalid-id
```
**Expected Response:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Log not found",
    "details": null
  }
}
```

## AI Service Test Script

Save as `test-ai-service.sh`:
```bash
#!/bin/bash
echo "Testing AI Service..."

# AI service health check
echo "1. AI Service Health Check..."
curl -s http://localhost:8000/health | jq .

# AI prediction test
echo "2. AI Prediction Test..."
curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"paper_pct":30,"plastic_pct":20,"organic_pct":40,"moisture_pct":10}' | jq .

echo "AI Service tests completed!"
```

## Test Script

Save as `test-incineration.sh`:
```bash
#!/bin/bash
echo "Testing Incineration Subsystem..."

# Health check
echo "1. Health check..."
curl -s http://localhost:5000/health | jq .

# Get logs
echo "2. Get logs..."
curl -s http://localhost:5000/api/waste/logs | jq .

# Create log
echo "3. Create log..."
LOG_ID=$(curl -s -X POST http://localhost:5000/api/waste/logs \
  -H "Content-Type: application/json" \
  -d '{"weight":100,"category":"municipal","location":"Test","composition":{"paper_pct":30,"plastic_pct":20,"organic_pct":40,"moisture_pct":10}}' | jq -r '.data._id')

# Get daily reports
echo "4. Daily reports..."
curl -s http://localhost:5000/api/waste/reports/daily | jq .

# Get monthly reports
echo "5. Monthly reports..."
curl -s http://localhost:5000/api/waste/reports/monthly | jq .

echo "Tests completed!"
```

## Postman Collection

Import the following JSON into Postman:

```json
{
  "info": {
    "name": "Incineration Subsystem",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Get All Logs",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:5000/api/waste/logs",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "waste", "logs"]
        }
      }
    },
    {
      "name": "Create Waste Log",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"weight\": 100,\n  \"category\": \"municipal\",\n  \"location\": \"Test Facility\",\n  \"composition\": {\n    \"paper_pct\": 30,\n    \"plastic_pct\": 20,\n    \"organic_pct\": 40,\n    \"moisture_pct\": 10\n  }\n}"
        },
        "url": {
          "raw": "http://localhost:5000/api/waste/logs",
          "protocol": "http",
          "host": ["localhost"],
          "port": "5000",
          "path": ["api", "waste", "logs"]
        }
      }
    }
  ]
}
```
