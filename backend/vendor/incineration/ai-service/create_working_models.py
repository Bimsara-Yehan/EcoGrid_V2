import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Create realistic training data
np.random.seed(42)
n_samples = 1000

# Generate realistic waste compositions
paper_pct = np.random.uniform(10, 50, n_samples)
plastic_pct = np.random.uniform(5, 40, n_samples)
organic_pct = np.random.uniform(20, 70, n_samples)
moisture_pct = np.random.uniform(5, 25, n_samples)

# Generate operational parameters
airflow = np.random.uniform(200, 600, n_samples)
grate_speed = np.random.uniform(0.5, 2.0, n_samples)
feed_rate = np.random.uniform(3, 9, n_samples)
o2_target = np.random.uniform(3, 9, n_samples)
burner_temp = np.random.uniform(750, 1000, n_samples)

# Create realistic energy and emissions predictions based on composition and settings
# Energy: higher with more organic content, optimal temperature, good airflow
energy_base = (organic_pct * 0.8 + plastic_pct * 0.6 + paper_pct * 0.4) * 0.1
temp_factor = np.where((burner_temp >= 800) & (burner_temp <= 950), 1.2, 0.8)
airflow_factor = np.where((airflow >= 300) & (airflow <= 500), 1.1, 0.9)
energy_output = energy_base * temp_factor * airflow_factor + np.random.normal(0, 0.5, n_samples)

# Emissions: higher with more plastic, lower with better O2 control
emissions_base = (plastic_pct * 0.3 + organic_pct * 0.1) * 0.2
o2_factor = np.where((o2_target >= 4) & (o2_target <= 7), 0.8, 1.2)
emissions_index = emissions_base * o2_factor + np.random.normal(0, 0.1, n_samples)

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

# Split features and targets
X = data[['paper_pct', 'plastic_pct', 'organic_pct', 'moisture_pct', 'airflow', 'grate_speed', 'feed_rate', 'o2_target', 'burner_temp']]
y_energy = data['energy_output']
y_emissions = data['emissions_index']

# Create and train energy model
energy_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])
energy_pipeline.fit(X, y_energy)

# Create and train emissions model
emissions_pipeline = Pipeline([
    ('scaler', StandardScaler()),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])
emissions_pipeline.fit(X, y_emissions)

# Test the models
test_data = pd.DataFrame([[30, 15, 40, 15, 500, 1.5, 7, 6, 900]], 
                        columns=['paper_pct', 'plastic_pct', 'organic_pct', 'moisture_pct', 'airflow', 'grate_speed', 'feed_rate', 'o2_target', 'burner_temp'])

energy_pred = energy_pipeline.predict(test_data)[0]
emissions_pred = emissions_pipeline.predict(test_data)[0]

print(f'Test prediction - Energy: {energy_pred:.2f}, Emissions: {emissions_pred:.2f}')

# Save the models
joblib.dump(energy_pipeline, 'models/energy_v1_working.joblib')
joblib.dump(emissions_pipeline, 'models/emissions_v1_working.joblib')

print('Working models saved!')

