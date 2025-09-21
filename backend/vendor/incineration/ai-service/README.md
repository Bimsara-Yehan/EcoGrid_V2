Incineration AI Service

Quickstart

1) Create venv (Windows PowerShell):
```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r ai-service/requirements.txt
```

2) Prepare data
- Export logs to `ai-service/data/waste_logs.csv` with columns:
  - Features: paper_pct, plastic_pct, organic_pct, moisture_pct, airflow, grate_speed, feed_rate, o2_target, burner_temp
  - Targets: energy_output, emissions_index
  - Optional: timestamp

3) Train models:
```powershell
python ai-service/train.py
```

4) Run service:
```powershell
$env:AI_API_KEY = "changeme"
uvicorn ai-service.app:app --host 0.0.0.0 --port 8000
```

5) Test endpoints (PowerShell):
```powershell
$body = @{ paper_pct=30; plastic_pct=15; organic_pct=40; moisture_pct=15 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8000/predict -Headers @{"x-api-key"="$env:AI_API_KEY"} -Body $body -ContentType 'application/json'
```

Notes
- Edit feature names/targets in `ai-service/train.py` if your schema differs.
- Place trained models in `ai-service/models/` or run the training script to generate them.


