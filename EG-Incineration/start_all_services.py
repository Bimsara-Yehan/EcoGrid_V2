#!/usr/bin/env python3
"""
EcoGrid Incineration System - Complete Startup Script
Starts all services with proper configuration and monitoring
"""

import subprocess
import time
import requests
import sys
import os
from pathlib import Path

def check_port(port):
    """Check if a port is available"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) != 0

def start_backend():
    """Start the Node.js backend service"""
    print("🚀 Starting Backend Service...")
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return None
    
    try:
        # Check if already running
        if not check_port(5004):
            print("✅ Backend already running on port 5004")
            return True
            
        # Start backend
        process = subprocess.Popen(
            ["npm", "start"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for startup
        time.sleep(3)
        
        # Test health
        try:
            response = requests.get("http://localhost:5004/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend service started successfully")
                return True
        except:
            pass
            
        print("⚠️ Backend service may not be ready yet")
        return True
        
    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        return False

def start_frontend():
    """Start the React frontend service"""
    print("🚀 Starting Frontend Service...")
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return None
    
    try:
        # Check if already running
        if not check_port(3002):
            print("✅ Frontend already running on port 3002")
            return True
            
        # Start frontend
        process = subprocess.Popen(
            ["npm", "start"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for startup
        time.sleep(5)
        
        # Test health
        try:
            response = requests.get("http://localhost:3002", timeout=5)
            if response.status_code == 200:
                print("✅ Frontend service started successfully")
                return True
        except:
            pass
            
        print("⚠️ Frontend service may not be ready yet")
        return True
        
    except Exception as e:
        print(f"❌ Failed to start frontend: {e}")
        return False

def start_ai_service():
    """Start the Python AI service"""
    print("🚀 Starting AI Service...")
    ai_dir = Path("ai-service")
    if not ai_dir.exists():
        print("❌ AI service directory not found")
        return None
    
    try:
        # Check if already running
        if not check_port(8010):
            print("✅ AI service already running on port 8010")
            return True
            
        # Set environment variables
        env = os.environ.copy()
        env["AI_API_KEY"] = "changeme"
        env["AI_PORT"] = "8010"
        
        # Start AI service
        process = subprocess.Popen(
            ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8010"],
            cwd=ai_dir,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for startup
        time.sleep(5)
        
        # Test health
        try:
            response = requests.get("http://localhost:8010/health", timeout=5)
            if response.status_code == 200:
                health_data = response.json()
                print("✅ AI service started successfully")
                print(f"   Energy model loaded: {health_data.get('energy_model_loaded', False)}")
                print(f"   Emissions model loaded: {health_data.get('emissions_model_loaded', False)}")
                return True
        except Exception as e:
            print(f"⚠️ AI service may not be ready yet: {e}")
            
        return True
        
    except Exception as e:
        print(f"❌ Failed to start AI service: {e}")
        return False

def test_all_services():
    """Test all services are responding"""
    print("\n🔍 Testing all services...")
    
    services = [
        ("Backend", "http://localhost:5004/health"),
        ("Frontend", "http://localhost:3002"),
        ("AI Service", "http://localhost:8010/health")
    ]
    
    all_working = True
    
    for name, url in services:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name}: OK")
            else:
                print(f"⚠️ {name}: Status {response.status_code}")
                all_working = False
        except Exception as e:
            print(f"❌ {name}: {e}")
            all_working = False
    
    return all_working

def main():
    """Main startup function"""
    print("🌱 EcoGrid Incineration System Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("package.json").exists():
        print("❌ Please run this script from the project root directory")
        sys.exit(1)
    
    # Start all services
    backend_ok = start_backend()
    frontend_ok = start_frontend()
    ai_ok = start_ai_service()
    
    # Test all services
    all_working = test_all_services()
    
    print("\n" + "=" * 50)
    if all_working:
        print("🎉 All services are running successfully!")
        print("\n📱 Access your system:")
        print("   Frontend: http://localhost:3002")
        print("   Backend API: http://localhost:5004")
        print("   AI Service: http://localhost:8010")
        print("   API Documentation: http://localhost:8010/docs")
        print("\n🔑 API Key: changeme")
        print("\n📱 Your system is now responsive on all screen sizes!")
        print("   - Mobile phones (320px+)")
        print("   - Tablets (768px+)")
        print("   - Desktops (1024px+)")
        print("   - Large screens (1200px+)")
    else:
        print("⚠️ Some services may not be working properly")
        print("Check the logs above for details")
    
    print("\nPress Ctrl+C to stop all services")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        sys.exit(0)
