# Smoke Tests for Waste Management Subsystem

## Test Environment
- **Base URL**: `http://localhost:5000/api/waste-management`
- **Database**: Staging Atlas cluster (EcoGrid_V2)
- **Authentication**: JWT Bearer tokens

## Test Data Setup
Before running tests, ensure you have:
1. A test user registered
2. Valid JWT token for authentication
3. Staging database accessible

## API Endpoint Tests

### 1. Authentication Endpoints

#### Register User
```bash
curl -X POST http://localhost:5000/api/waste-management/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "1234567890",
    "address": "123 Test St"
  }'
```
**Expected**: 200 OK with user data and token

#### Login User
```bash
curl -X POST http://localhost:5000/api/waste-management/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```
**Expected**: 200 OK with user data and token

#### Get Current User
```bash
curl -X GET http://localhost:5000/api/waste-management/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with user profile data

### 2. Waste Collection Endpoints

#### Get Waste Collections
```bash
curl -X GET http://localhost:5000/api/waste-management/waste-collection \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with collection list

#### Create Waste Collection
```bash
curl -X POST http://localhost:5000/api/waste-management/waste-collection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "wasteType": "organic",
    "quantity": 5,
    "location": {
      "address": "123 Test St",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    },
    "preferredDate": "2024-01-15",
    "notes": "Test collection request"
  }'
```
**Expected**: 201 Created with collection data

### 3. Recycling Guide Endpoints

#### Get Recycling Guides
```bash
curl -X GET http://localhost:5000/api/waste-management/recycling-guide \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with guide list

### 4. Reports Endpoints

#### Get Reports
```bash
curl -X GET http://localhost:5000/api/waste-management/reports \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with reports list

#### Create Report
```bash
curl -X POST http://localhost:5000/api/waste-management/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "illegal_dumping",
    "description": "Test report",
    "location": {
      "address": "123 Test St",
      "coordinates": {
        "latitude": 40.7128,
        "longitude": -74.0060
      }
    },
    "priority": "medium"
  }'
```
**Expected**: 201 Created with report data

### 5. Tasks Endpoints

#### Get Tasks
```bash
curl -X GET http://localhost:5000/api/waste-management/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with tasks list

### 6. Composting Endpoints

#### Get Composting Stations
```bash
curl -X GET http://localhost:5000/api/waste-management/composting/stations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with stations list

### 7. Chatbot Endpoints

#### Send Chat Message
```bash
curl -X POST http://localhost:5000/api/waste-management/chatbot/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "How do I recycle plastic bottles?",
    "sessionId": "test-session-123"
  }'
```
**Expected**: 200 OK with chatbot response

#### Get Chat History
```bash
curl -X GET http://localhost:5000/api/waste-management/chatbot/history \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with chat history

### 8. User Profile Endpoints

#### Get User Profile
```bash
curl -X GET http://localhost:5000/api/waste-management/user-profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
**Expected**: 200 OK with profile data

#### Update User Profile
```bash
curl -X PUT http://localhost:5000/api/waste-management/user-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Updated Test User",
    "phone": "0987654321",
    "address": "456 Updated St"
  }'
```
**Expected**: 200 OK with updated profile

## Error Response Tests

### Invalid Authentication
```bash
curl -X GET http://localhost:5000/api/waste-management/waste-collection \
  -H "Authorization: Bearer invalid_token"
```
**Expected**: 401 Unauthorized with error envelope

### Missing Required Fields
```bash
curl -X POST http://localhost:5000/api/waste-management/waste-collection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}'
```
**Expected**: 400 Bad Request with validation errors

## Response Format Validation

All successful responses should follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

All error responses should follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": "Optional additional details"
  }
}
```

## Test Checklist

- [ ] All endpoints return proper HTTP status codes
- [ ] All responses follow the standard envelope format
- [ ] Authentication works correctly
- [ ] Validation errors are properly formatted
- [ ] Database operations work with staging cluster
- [ ] File uploads work (if applicable)
- [ ] Geospatial queries work correctly
- [ ] Error handling is consistent across all endpoints

## Notes

- Replace `YOUR_JWT_TOKEN` with actual JWT token from login response
- Ensure staging database is accessible before running tests
- Some tests may require specific user roles or permissions
- File upload tests may require multipart/form-data content type
