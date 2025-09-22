# Waste Management System - Smoke Tests

## Test Environment
- **Base URL**: `http://localhost:5000/api/waste`
- **Database**: Staging Atlas cluster only
- **Authentication**: None (for testing)

## Test Cases

### 1. Customer Management

#### Create Customer
```bash
curl -X POST http://localhost:5000/api/waste/customers \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "fullName": "Test Customer",
    "phones": ["+1234567890"],
    "addresses": [{
      "label": "Home",
      "addressLine": "123 Test St",
      "geo": {
        "type": "Point",
        "coordinates": [-74.0059, 40.7128]
      }
    }]
  }'
```
**Expected**: 201 Created with customer data

#### Get All Customers
```bash
curl -X GET http://localhost:5000/api/waste/customers
```
**Expected**: 200 OK with array of customers

#### Get Customer by ID
```bash
curl -X GET http://localhost:5000/api/waste/customers/{customerId}
```
**Expected**: 200 OK with customer data or 404 Not Found

### 2. Zone Management

#### Create Zone
```bash
curl -X POST http://localhost:5000/api/waste/zones \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Zone",
    "areaType": "Urban",
    "description": "Test zone for smoke testing",
    "polygon": {
      "type": "Polygon",
      "coordinates": [[
        [-74.0059, 40.7128],
        [-74.0059, 40.7228],
        [-73.9959, 40.7228],
        [-73.9959, 40.7128],
        [-74.0059, 40.7128]
      ]]
    }
  }'
```
**Expected**: 201 Created with zone data

#### Get All Zones
```bash
curl -X GET http://localhost:5000/api/waste/zones
```
**Expected**: 200 OK with array of zones including customer counts

#### Get Zone by ID
```bash
curl -X GET http://localhost:5000/api/waste/zones/{zoneId}
```
**Expected**: 200 OK with zone data or 404 Not Found

### 3. Subscription Management

#### Create Subscription Plan
```bash
curl -X POST http://localhost:5000/api/waste/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "zoneId": "{zoneId}",
    "planName": "Weekly Pickup",
    "frequency": "weekly",
    "price": 25.00,
    "maxWeightPerPickupKg": 50,
    "description": "Weekly waste pickup service"
  }'
```
**Expected**: 201 Created with subscription plan data

#### Get All Subscriptions
```bash
curl -X GET http://localhost:5000/api/waste/subscriptions
```
**Expected**: 200 OK with array of subscription plans

#### Get Subscriptions by Zone
```bash
curl -X GET http://localhost:5000/api/waste/subscriptions/zone/{zoneId}
```
**Expected**: 200 OK with array of subscription plans for zone

### 4. Dashboard/Summary

#### Get Summary Data
```bash
curl -X GET http://localhost:5000/api/waste/summary
```
**Expected**: 200 OK with summary data including:
- customerCountPerZone
- customerCountPerFrequency
- subCountPerFrequency
- revenuePerFrequency
- totalZones
- zoneTypeCounts
- customerCoverage
- customerDistribution
- subscriptionGrowth

### 5. Error Handling Tests

#### Invalid Customer ID
```bash
curl -X GET http://localhost:5000/api/waste/customers/invalid-id
```
**Expected**: 404 Not Found with error message

#### Invalid Zone ID
```bash
curl -X GET http://localhost:5000/api/waste/zones/invalid-id
```
**Expected**: 404 Not Found with error message

#### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/waste/customers \
  -H "Content-Type: application/json" \
  -d '{"fullName": "Incomplete Customer"}'
```
**Expected**: 400 Bad Request with validation error

## Response Format Validation

All successful responses should follow:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

All error responses should follow:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": "Optional additional details"
  }
}
```

## Test Execution Order

1. Create a zone first
2. Create a customer
3. Create a subscription plan
4. Test all GET endpoints
5. Test error scenarios
6. Test summary endpoint

## Notes

- Replace `{customerId}`, `{zoneId}` with actual IDs from previous requests
- All tests use staging database only
- No authentication required for smoke tests
- Tests should be run against a clean database state
