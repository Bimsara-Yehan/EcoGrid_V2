# Waste Management Subsystem Handoff

## Entry Points
- **Backend:** `backend/index.js`
- **Frontend:** `frontend/src/App.js`

## Startup Commands
```bash
# Backend
cd backend
npm install
npm start
# Runs on PORT (default: 5001)

# Frontend  
cd frontend
npm install
npm start
# Runs on port 5173 (Vite default)
```

## API Routes

### Authentication Routes
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/me` | Get current user profile | Yes |
| PUT | `/api/auth/onboarding` | Mark onboarding complete | Yes |

### User Profile Routes
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/user-profile` | Get user profile | Yes |
| PUT | `/api/user-profile` | Update user profile | Yes |
| PUT | `/api/user-profile/password` | Change password | Yes |
| PUT | `/api/user-profile/image` | Update profile image | Yes |
| PUT | `/api/user-profile/preferences` | Update preferences | Yes |
| PUT | `/api/user-profile/preferences/theme` | Toggle dark mode | Yes |
| PUT | `/api/user-profile/preferences/language` | Update language | Yes |
| PUT | `/api/user-profile/preferences/notifications` | Toggle notifications | Yes |
| DELETE | `/api/user-profile` | Delete account | Yes |

### Waste Management Routes
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/composting/stations` | Get composting stations | No |
| POST | `/api/special-requests` | Create special request | Yes |
| GET | `/api/special-requests` | Get user's requests | Yes |
| GET | `/api/special-requests/admin/all` | Get all requests (Admin) | Yes (Admin/Manager) |
| GET | `/api/special-requests/:id` | Get specific request | Yes |
| PUT | `/api/special-requests/:id` | Update request | Yes |
| DELETE | `/api/special-requests/:id` | Cancel request | Yes |

### Health Check
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/health` | Health check | No |

## Environment Variables

### Backend (.env)
```ini
PORT=5001
MONGO_URI=mongodb://localhost:27017/ecogrid
JWT_SECRET=your-secret-key-here
```

### Frontend (.env)
```ini
VITE_API_BASE=http://localhost:5001
```

## Authentication
- **Type:** JWT Bearer Token
- **Header:** `Authorization: Bearer <token>`
- **Token expires:** 24 hours
- **Roles:** Customer, Admin, Manager, TruckDriver, Incinerator

## Database Models

### Customer Model
- **Collection:** `customers`
- **Required fields:** `userId`, `fullName`
- **Phone structure:** Array of strings `["1234567890"]`
- **Address structure:** Array of objects with `label`, `addressLine`, `geo`, `zoneId`

### User Model
- **Collection:** `users`
- **Required fields:** `email`, `password`
- **Roles:** Array of strings

### SpecialRequest Model
- **Collection:** `specialrequests`
- **Required fields:** `customerId`, `wasteType`, `quantity`, `preferredDate`, `preferredTime`

## Known Gotchas

### Phone/Address Structure
- Phones are stored as **strings** in array: `["1234567890"]`
- Addresses use **flattened structure** with both `addressLine` and `street` fields
- API responses include flattened `phone` and `address` fields for compatibility

### File Uploads
- Profile images stored in `backend/uploads/`
- Multer configured for 5MB limit
- Images accessible via `/uploads/filename`

### Dark Mode
- Comprehensive dark mode styling applied to all screens
- Uses Tailwind CSS `dark:` variants
- Theme context manages state

### Geolocation
- Graceful error handling for geolocation failures
- Defaults to Kandy center coordinates if location unavailable
- 5-second timeout for location requests

## Dependencies

### Backend
- Express.js
- Mongoose
- JWT authentication
- Multer (file uploads)
- CORS enabled

### Frontend
- React 18
- React Router
- Tailwind CSS
- Vite
- Axios
- Lucide React (icons)

## Integration Notes
- All routes are namespaced under `/api/`
- CORS configured for frontend origin
- Error responses follow standard format: `{ success: boolean, error?: { code: string, message: string } }`
- Vendor directory contains original subsystem files
- Adapter files in root provide integration points
