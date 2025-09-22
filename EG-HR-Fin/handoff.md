# Handoff Documentation - EcoGrid Staff Management System

## Entry Points
- **Backend**: `backend/server.js` (runs on port 5000)
- **Frontend**: `frontend/src/App.js` (runs on port 3000)
- **Database**: MongoDB Atlas (staging environment)

## Environment Setup
1. Copy `.env.example` to `.env` and update values
2. Backend: `npm install && npm start`
3. Frontend: `npm install && npm start`

## API Routes

### Health & Status
| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/api/health` | Health check | `{ ok: true }` |
| GET | `/api/test` | Server status | `{ message: "Server is running!", timestamp: "...", status: "success" }` |

### Staff Management
| Method | Path | Description | Response Format |
|--------|------|-------------|-----------------|
| GET | `/api/staff` | Get all staff members | `{ success: true, data: [...] }` |
| GET | `/api/staff/:id` | Get staff by ID | `{ success: true, data: {...} }` |
| POST | `/api/staff` | Create new staff | `{ success: true, data: {...} }` |
| PUT | `/api/staff/:id` | Update staff | `{ success: true, data: {...} }` |
| DELETE | `/api/staff/:id` | Delete staff | `{ success: true, message: "..." }` |

### Leave Requests
| Method | Path | Description | Response Format |
|--------|------|-------------|-----------------|
| GET | `/api/leaverequests` | Get all leave requests | `{ success: true, data: [...] }` |
| GET | `/api/leaverequests/:id` | Get leave request by ID | `{ success: true, data: {...} }` |
| POST | `/api/leaverequests` | Create leave request | `{ success: true, data: {...} }` |
| PUT | `/api/leaverequests/:id` | Update leave request | `{ success: true, data: {...} }` |
| DELETE | `/api/leaverequests/:id` | Delete leave request | `{ success: true, message: "..." }` |

### Payments
| Method | Path | Description | Response Format |
|--------|------|-------------|-----------------|
| GET | `/api/payments` | Get all payments | `{ success: true, data: [...] }` |
| GET | `/api/payments/:id` | Get payment by ID | `{ success: true, data: {...} }` |
| POST | `/api/payments` | Create payment | `{ success: true, data: {...} }` |
| PUT | `/api/payments/:id` | Update payment | `{ success: true, data: {...} }` |
| DELETE | `/api/payments/:id` | Delete payment | `{ success: true, message: "..." }` |

## Frontend Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | Dashboard | Main dashboard with stats |
| `/staff` | StaffList | List all staff members |
| `/add` | AddStaff | Add new staff form |
| `/edit/:id` | EditStaff | Edit staff form |
| `/staff/:id` | StaffDetails | Staff details view |
| `/leave-requests` | LeaveRequestList | List leave requests |
| `/add-leave-request` | AddLeaveRequest | Add leave request form |
| `/payments` | PaymentList | List payments |
| `/payments/add` | AddPayment | Add payment form |
| `/admin-profile` | AdminProfile | Admin profile page |

## Database Collections
- **staff**: Staff member information
- **leaverequests**: Leave request data
- **payments**: Payment records
- **counters**: Auto-increment counters

## Environment Variables Required
- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `REACT_APP_API_URL`: Frontend API base URL

## Known Issues & Gotchas
1. **Port Configuration**: Backend runs on 5000, frontend on 3000
2. **CORS**: Configured for localhost:3000
3. **Database**: Uses staging MongoDB Atlas only
4. **Authentication**: No JWT implementation yet (basic CRUD only)
5. **File Uploads**: Not implemented
6. **Real-time Updates**: Not implemented

## Quick Test Commands
```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test staff API
curl http://localhost:5000/api/staff

# Test leave requests
curl http://localhost:5000/api/leaverequests
```

## Integration Notes
- All API responses use envelope format: `{ success: boolean, data?: any, error?: any, message?: string }`
- Frontend uses React Router v6 with future flags enabled
- No TypeScript (pure JavaScript/JSX)
- External CSS files (no inline styles)
- Responsive design with mobile support
