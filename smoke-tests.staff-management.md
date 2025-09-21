# Staff Management Smoke Tests

## Backend API Tests

### Base URL
```
http://localhost:3001/api/staff-management
```

### 1. Staff Management Tests

#### Create Staff Member
```bash
curl -X POST http://localhost:3001/api/staff-management/staff \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "Manager",
    "staffType": "staff",
    "department": "IT"
  }'
```
**Expected**: 201 Created with staff data

#### Get All Staff
```bash
curl http://localhost:3001/api/staff-management/staff
```
**Expected**: 200 OK with staff array

#### Get Staff by ID
```bash
curl http://localhost:3001/api/staff-management/staff/{staffId}
```
**Expected**: 200 OK with staff data

### 2. Leave Request Tests

#### Create Leave Request
```bash
curl -X POST http://localhost:3001/api/staff-management/leaverequests \
  -H "Content-Type: application/json" \
  -d '{
    "staffID": "{staffId}",
    "leaveType": "Annual",
    "startDate": "2024-01-15",
    "endDate": "2024-01-20",
    "reason": "Vacation"
  }'
```
**Expected**: 201 Created with leave request data

#### Get All Leave Requests
```bash
curl http://localhost:3001/api/staff-management/leaverequests
```
**Expected**: 200 OK with leave requests array

#### Update Leave Request Status
```bash
curl -X PATCH http://localhost:3001/api/staff-management/leaverequests/{leaveRequestId}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Approved"}'
```
**Expected**: 200 OK with updated leave request

### 3. Payment Tests

#### Create Payment
```bash
curl -X POST http://localhost:3001/api/staff-management/payments \
  -H "Content-Type: application/json" \
  -d '{
    "staffID": "{staffId}",
    "amount": 5000,
    "paymentType": "Salary",
    "date": "2024-01-01",
    "status": "Completed"
  }'
```
**Expected**: 201 Created with payment data

#### Get All Payments
```bash
curl http://localhost:3001/api/staff-management/payments
```
**Expected**: 200 OK with payments array

## Frontend Tests

### 1. Page Loading
- Navigate to `/dashboard` - should load dashboard
- Navigate to `/staff` - should load staff management
- Navigate to `/leave-requests` - should load leave requests
- Navigate to `/payments` - should load payments

### 2. API Integration
- All pages should load data from API
- Forms should submit data successfully
- Error handling should work properly

## Response Format Validation

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  }
}
```

## Test Steps
1. Start backend server: `npm run dev` in backend/
2. Start frontend: `npm start` in frontend/
3. Run curl commands above
4. Test frontend pages
5. Verify database operations in MongoDB Atlas staging
