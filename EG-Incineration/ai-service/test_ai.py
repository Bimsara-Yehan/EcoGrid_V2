import requests
import json

# Test the AI service
url = "http://localhost:8010/recommend"
headers = {"x-api-key": "changeme", "Content-Type": "application/json"}

payload = {
    "waste": {
        "paper_pct": 30,
        "plastic_pct": 15,
        "organic_pct": 40,
        "moisture_pct": 15
    },
    "constraints": {
        "airflow_min": 200,
        "airflow_max": 600,
        "grate_speed_min": 0.5,
        "grate_speed_max": 2.0,
        "feed_rate_min": 3,
        "feed_rate_max": 9,
        "o2_target_min": 3,
        "o2_target_max": 9,
        "burner_temp_min": 750,
        "burner_temp_max": 1000,
        "emissions_cap": 200
    },
    "lambda_penalty": 0.5,
    "n_samples": 3
}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

