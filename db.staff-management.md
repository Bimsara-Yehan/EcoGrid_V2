# Staff Management Database Configuration

## Collections Used

### 1. `staff` Collection
- **Purpose**: Store staff member information
- **Indexes**: 
  - `{ staffID: 1 }` (unique)
  - `{ email: 1 }` (unique)
  - `{ role: 1 }`
  - `{ staffType: 1 }`

### 2. `leaverequests` Collection
- **Purpose**: Store leave request information
- **Indexes**:
  - `{ leaveRequestID: 1 }` (unique)
  - `{ staffID: 1 }`
  - `{ status: 1 }`
  - `{ requestedDate: -1 }`
  - `{ startDate: 1, endDate: 1 }`

### 3. `payments` Collection
- **Purpose**: Store payment information
- **Indexes**:
  - `{ paymentID: 1 }` (unique)
  - `{ staffID: 1 }`
  - `{ date: -1 }`
  - `{ status: 1 }`

### 4. `counters` Collection
- **Purpose**: Auto-increment counters for IDs
- **Indexes**:
  - `{ _id: 1 }` (unique)

## Schema Expectations

### Model Names
- `Staff` - staff collection
- `LeaveRequest` - leaverequests collection  
- `Payment` - payments collection
- `Counter` - counters collection

### Reference Strings
- `staffID` references `Staff._id`
- `approvedRejectedBy` references `Staff._id`

## Database Operations

### Creates (Y)
- ✅ New staff members
- ✅ New leave requests
- ✅ New payments
- ✅ Counter documents

### Updates (Y)
- ✅ Staff information updates
- ✅ Leave request status changes
- ✅ Payment status updates
- ✅ Counter increments

### Deletes (Y)
- ✅ Staff member removal
- ✅ Leave request deletion
- ✅ Payment deletion

## Data Validation
- All models use Mongoose schemas with validation
- Required fields are enforced
- Data types are validated
- Unique constraints on staffID, email, leaveRequestID, paymentID
