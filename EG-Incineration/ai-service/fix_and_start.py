#!/usr/bin/env python3
"""
AI Service Fix and Start Script
This script fixes common issues and starts the AI service properly.
"""

import os
import sys
import subprocess
import time
import requests
import json
from pathlib import Path

def check_dependencies():
    """Check if all required dependencies are installed."""
    print("🔍 Checking dependencies...")
    try:
        import fastapi
        import uvicorn
        import sklearn
        import pandas
        import numpy
        import joblib
        import requests
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Run: pip install -r requirements.txt")
        return False

def check_models():
    """Check if model files exist."""
    print("🔍 Checking model files...")
    models_dir = Path(__file__).parent / "models"
    energy_model = models_dir / "energy_v1_working.joblib"
    emissions_model = models_dir / "emissions_v1_working.joblib"
    
    if energy_model.exists() and emissions_model.exists():
        print("✅ Model files found")
        return True
    else:
        print("❌ Model files missing. Creating working models...")
        try:
            subprocess.run([sys.executable, "create_working_models.py"], check=True, cwd=Path(__file__).parent)
            print("✅ Working models created")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to create models: {e}")
            return False

def test_service():
    """Test if the service is working properly."""
    print("🔍 Testing service...")
    try:
        # Test health endpoint
        response = requests.get("http://localhost:8010/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Service is running (version {health_data.get('app_version', 'unknown')})")
            print(f"   Energy model loaded: {health_data.get('energy_model_loaded', False)}")
            print(f"   Emissions model loaded: {health_data.get('emissions_model_loaded', False)}")
            
            # Test predict endpoint
            predict_payload = {
                "paper_pct": 30,
                "plastic_pct": 15,
                "organic_pct": 40,
                "moisture_pct": 15
            }
            predict_response = requests.post(
                "http://localhost:8010/predict",
                headers={"x-api-key": "changeme"},
                json=predict_payload,
                timeout=5
            )
            
            if predict_response.status_code == 200:
                predict_data = predict_response.json()
                print(f"✅ Predict endpoint working")
                print(f"   Energy prediction: {predict_data.get('pred_energy', 'N/A'):.2f}")
                print(f"   Emissions prediction: {predict_data.get('pred_emissions', 'N/A'):.2f}")
                return True
            else:
                print(f"❌ Predict endpoint failed: {predict_response.text}")
                return False
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Service is not running")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def start_service():
    """Start the AI service."""
    print("🚀 Starting AI service...")
    
    # Set environment variables
    env = os.environ.copy()
    env["AI_API_KEY"] = "changeme"
    env["AI_PORT"] = "8010"
    
    try:
        # Start the service
        process = subprocess.Popen(
            [sys.executable, "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8010"],
            cwd=Path(__file__).parent,
            env=env
        )
        
        # Wait a moment for the service to start
        time.sleep(3)
        
        # Test if it's working
        if test_service():
            print("✅ AI service started successfully!")
            print("🌐 Service available at: http://localhost:8010")
            print("📚 API Documentation: http://localhost:8010/docs")
            print("🔑 API Key: changeme")
            print("\nPress Ctrl+C to stop the service")
            
            try:
                process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping service...")
                process.terminate()
                process.wait()
                print("✅ Service stopped")
        else:
            print("❌ Service failed to start properly")
            process.terminate()
            return False
            
    except Exception as e:
        print(f"❌ Failed to start service: {e}")
        return False

def main():
    """Main function to fix and start the AI service."""
    print("🔧 AI Service Fix and Start Script")
    print("=" * 40)
    
    # Check if we're in the right directory
    if not Path("app.py").exists():
        print("❌ Please run this script from the ai-service directory")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check models
    if not check_models():
        sys.exit(1)
    
    # Test if service is already running
    if test_service():
        print("✅ Service is already running and working!")
        return
    
    # Start the service
    start_service()

if __name__ == "__main__":
    main()
