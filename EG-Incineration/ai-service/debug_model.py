import joblib
import pandas as pd

# Load the model
model = joblib.load('models/energy_v1_20250918093419.joblib')

print('Model type:', type(model))
print('Pipeline steps:', [step[0] for step in model.steps])
print('Final estimator:', model.steps[-1][1])
print('Has coef_:', hasattr(model.steps[-1][1], 'coef_'))

if hasattr(model.steps[-1][1], 'coef_'):
    print('Coefficients:', model.steps[-1][1].coef_)
    print('Intercept:', model.steps[-1][1].intercept_)

# Test with different inputs
test_cases = [
    [30, 15, 40, 15, 500, 1.5, 7, 6, 900],
    [50, 20, 20, 10, 400, 2.0, 8, 5, 800],
    [10, 5, 70, 15, 600, 1.0, 5, 7, 1000]
]

for i, test_case in enumerate(test_cases):
    test_data = pd.DataFrame([test_case], columns=['paper_pct', 'plastic_pct', 'organic_pct', 'moisture_pct', 'airflow', 'grate_speed', 'feed_rate', 'o2_target', 'burner_temp'])
    prediction = model.predict(test_data)[0]
    print(f'Test case {i+1}: {test_case} -> Prediction: {prediction}')

