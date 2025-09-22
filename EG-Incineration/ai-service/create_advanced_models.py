#!/usr/bin/env python3
"""
Advanced AI Models for Incineration Optimization
Creates more accurate models with better algorithms and realistic data
"""

import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import warnings
warnings.filterwarnings('ignore')

def create_realistic_training_data(n_samples=5000):
    """Create more realistic and comprehensive training data"""
    np.random.seed(42)
    
    # Generate realistic waste compositions with correlations
    # Paper and cardboard are often together
    paper_base = np.random.uniform(15, 45, n_samples)
    cardboard = np.random.uniform(0, 20, n_samples)
    paper_pct = np.clip(paper_base + cardboard * 0.3, 0, 60)
    
    # Plastic varies widely
    plastic_pct = np.random.uniform(5, 50, n_samples)
    
    # Organic content (food waste, garden waste)
    organic_pct = np.random.uniform(20, 70, n_samples)
    
    # Moisture content correlates with organic content
    moisture_pct = np.clip(organic_pct * 0.3 + np.random.uniform(5, 15, n_samples), 5, 30)
    
    # Normalize to ensure percentages sum to 100
    total = paper_pct + plastic_pct + organic_pct + moisture_pct
    paper_pct = (paper_pct / total) * 100
    plastic_pct = (plastic_pct / total) * 100
    organic_pct = (organic_pct / total) * 100
    moisture_pct = (moisture_pct / total) * 100
    
    # Generate operational parameters with realistic correlations
    # Airflow affects combustion efficiency
    airflow = np.random.uniform(200, 800, n_samples)
    
    # Grate speed affects residence time
    grate_speed = np.random.uniform(0.3, 3.0, n_samples)
    
    # Feed rate affects throughput
    feed_rate = np.random.uniform(2, 15, n_samples)
    
    # O2 target for optimal combustion
    o2_target = np.random.uniform(3, 10, n_samples)
    
    # Burner temperature affects efficiency
    burner_temp = np.random.uniform(700, 1100, n_samples)
    
    # Create more sophisticated energy and emissions models
    # Energy production based on waste composition and operational parameters
    energy_base = (
        organic_pct * 0.12 +  # Organic waste has high energy content
        plastic_pct * 0.15 +  # Plastic has very high energy content
        paper_pct * 0.08      # Paper has moderate energy content
    )
    
    # Temperature efficiency curve (optimal around 850-950°C)
    temp_efficiency = np.where(
        (burner_temp >= 800) & (burner_temp <= 950),
        1.0 + 0.3 * np.sin((burner_temp - 800) * np.pi / 150),  # Peak efficiency
        0.7 + 0.2 * np.exp(-((burner_temp - 875) / 100) ** 2)   # Gaussian falloff
    )
    
    # Airflow efficiency (optimal around 400-600 m³/h)
    airflow_efficiency = np.where(
        (airflow >= 350) & (airflow <= 650),
        1.0 + 0.2 * np.sin((airflow - 350) * np.pi / 300),
        0.8 + 0.1 * np.exp(-((airflow - 500) / 150) ** 2)
    )
    
    # O2 efficiency (optimal around 5-7%)
    o2_efficiency = np.where(
        (o2_target >= 4) & (o2_target <= 8),
        1.0 + 0.15 * np.sin((o2_target - 4) * np.pi / 4),
        0.85 + 0.1 * np.exp(-((o2_target - 6) / 2) ** 2)
    )
    
    # Moisture penalty
    moisture_penalty = 1.0 - (moisture_pct * 0.01)
    
    # Calculate final energy output
    energy_output = (
        energy_base * 
        temp_efficiency * 
        airflow_efficiency * 
        o2_efficiency * 
        moisture_penalty + 
        np.random.normal(0, 0.3, n_samples)  # Add some noise
    )
    
    # Emissions calculation (more complex model)
    # Base emissions from waste composition
    emissions_base = (
        plastic_pct * 0.4 +  # Plastic produces more emissions
        organic_pct * 0.15 + # Organic waste produces moderate emissions
        paper_pct * 0.1      # Paper produces fewer emissions
    )
    
    # Temperature effect on emissions (higher temp = more complete combustion = fewer emissions)
    temp_emissions_factor = np.where(
        burner_temp >= 850,
        0.7 + 0.3 * np.exp(-((burner_temp - 900) / 50) ** 2),
        1.0 + 0.5 * (850 - burner_temp) / 150
    )
    
    # O2 effect on emissions (optimal O2 reduces emissions)
    o2_emissions_factor = np.where(
        (o2_target >= 4) & (o2_target <= 7),
        0.6 + 0.4 * np.sin((o2_target - 4) * np.pi / 3),
        1.0 + 0.3 * np.abs(o2_target - 6) / 3
    )
    
    # Airflow effect (too much or too little increases emissions)
    airflow_emissions_factor = np.where(
        (airflow >= 300) & (airflow <= 600),
        0.7 + 0.3 * np.sin((airflow - 300) * np.pi / 300),
        1.0 + 0.2 * np.abs(airflow - 450) / 200
    )
    
    # Moisture increases emissions
    moisture_emissions_factor = 1.0 + (moisture_pct * 0.02)
    
    # Calculate final emissions
    emissions_index = (
        emissions_base * 
        temp_emissions_factor * 
        o2_emissions_factor * 
        airflow_emissions_factor * 
        moisture_emissions_factor + 
        np.random.normal(0, 0.1, n_samples)
    )
    
    # Create DataFrame
    data = pd.DataFrame({
        'paper_pct': paper_pct,
        'plastic_pct': plastic_pct,
        'organic_pct': organic_pct,
        'moisture_pct': moisture_pct,
        'airflow': airflow,
        'grate_speed': grate_speed,
        'feed_rate': feed_rate,
        'o2_target': o2_target,
        'burner_temp': burner_temp,
        'energy_output': energy_output,
        'emissions_index': emissions_index
    })
    
    return data

def create_advanced_models(data):
    """Create advanced models with better algorithms"""
    # Prepare features and targets
    feature_cols = ['paper_pct', 'plastic_pct', 'organic_pct', 'moisture_pct', 
                   'airflow', 'grate_speed', 'feed_rate', 'o2_target', 'burner_temp']
    X = data[feature_cols]
    y_energy = data['energy_output']
    y_emissions = data['emissions_index']
    
    # Split data for validation
    X_train, X_test, y_energy_train, y_energy_test = train_test_split(X, y_energy, test_size=0.2, random_state=42)
    _, _, y_emissions_train, y_emissions_test = train_test_split(X, y_emissions, test_size=0.2, random_state=42)
    
    # Create advanced energy model (Ensemble)
    energy_models = [
        ('rf', RandomForestRegressor(n_estimators=200, max_depth=15, min_samples_split=5, random_state=42)),
        ('gb', GradientBoostingRegressor(n_estimators=200, max_depth=8, learning_rate=0.1, random_state=42)),
        ('ridge', Ridge(alpha=1.0))
    ]
    
    energy_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('poly', PolynomialFeatures(degree=2, include_bias=False)),
        ('scaler2', StandardScaler()),
        ('ensemble', RandomForestRegressor(n_estimators=300, max_depth=20, min_samples_split=3, random_state=42))
    ])
    
    # Create advanced emissions model
    emissions_pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('poly', PolynomialFeatures(degree=2, include_bias=False)),
        ('scaler2', StandardScaler()),
        ('ensemble', GradientBoostingRegressor(n_estimators=300, max_depth=12, learning_rate=0.08, random_state=42))
    ])
    
    # Train models
    print("Training energy model...")
    energy_pipeline.fit(X_train, y_energy_train)
    
    print("Training emissions model...")
    emissions_pipeline.fit(X_train, y_emissions_train)
    
    # Evaluate models
    energy_pred = energy_pipeline.predict(X_test)
    emissions_pred = emissions_pipeline.predict(X_test)
    
    energy_mae = mean_absolute_error(y_energy_test, energy_pred)
    energy_r2 = r2_score(y_energy_test, energy_pred)
    emissions_mae = mean_absolute_error(y_emissions_test, emissions_pred)
    emissions_r2 = r2_score(y_emissions_test, emissions_pred)
    
    print(f"Energy Model - MAE: {energy_mae:.3f}, R²: {energy_r2:.3f}")
    print(f"Emissions Model - MAE: {emissions_mae:.3f}, R²: {emissions_r2:.3f}")
    
    # Test with sample data
    test_sample = pd.DataFrame([[30, 15, 40, 15, 500, 1.5, 7, 6, 900]], columns=feature_cols)
    energy_pred_sample = energy_pipeline.predict(test_sample)[0]
    emissions_pred_sample = emissions_pipeline.predict(test_sample)[0]
    
    print(f"Sample prediction - Energy: {energy_pred_sample:.2f}, Emissions: {emissions_pred_sample:.2f}")
    
    return energy_pipeline, emissions_pipeline, {
        'energy_mae': energy_mae,
        'energy_r2': energy_r2,
        'emissions_mae': emissions_mae,
        'emissions_r2': emissions_r2,
        'feature_importance': dict(zip(feature_cols, energy_pipeline.named_steps['ensemble'].feature_importances_[:len(feature_cols)]))
    }

def main():
    """Main function to create and save advanced models"""
    print("Creating advanced AI models for incineration optimization...")
    
    # Create realistic training data
    print("Generating realistic training data...")
    data = create_realistic_training_data(5000)
    print(f"Generated {len(data)} training samples")
    
    # Create advanced models
    print("Creating advanced models...")
    energy_model, emissions_model, metrics = create_advanced_models(data)
    
    # Save models
    print("Saving models...")
    joblib.dump(energy_model, 'models/energy_v1_advanced.joblib')
    joblib.dump(emissions_model, 'models/emissions_v1_advanced.joblib')
    
    # Save metadata
    import json
    metadata = {
        'created_utc': pd.Timestamp.now().strftime('%Y%m%d%H%M%S'),
        'features': ['paper_pct', 'plastic_pct', 'organic_pct', 'moisture_pct', 'airflow', 'grate_speed', 'feed_rate', 'o2_target', 'burner_temp'],
        'metrics': metrics,
        'files': {
            'energy': 'energy_v1_advanced.joblib',
            'emissions': 'emissions_v1_advanced.joblib'
        },
        'model_type': 'advanced_ensemble',
        'training_samples': len(data)
    }
    
    with open('models/metadata_advanced.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print("Advanced models saved successfully!")
    print(f"Energy model R²: {metrics['energy_r2']:.3f}")
    print(f"Emissions model R²: {metrics['emissions_r2']:.3f}")

if __name__ == "__main__":
    main()
