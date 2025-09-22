# PR Template - Waste Management Subsystem Integration

## Domain
waste-management — base path `/api/waste-management`

## What's included
- Vendor code: `backend/vendor/waste-management/...`, `frontend/src/vendor/waste-management/...` (unchanged)
- Router adapter: `backend/routes/wasteManagementRoutes.js` (exports Express router)
- Page adapter: `frontend/src/pages/WasteManagement.tsx`
- Service adapter: `frontend/src/services/wasteManagement.ts`
- Dependencies: `backend/deps.waste-management.json`, `frontend/deps.waste-management.json`
- Env manifest: `env.waste-management.md`
- DB manifest: `db.waste-management.md`
- Smoke tests: `smoke-tests.waste-management.md` + curl commands

## API Endpoints
- Base path: `/api/waste-management`
- Endpoints and methods:
  - `POST /auth/register` - User registration
  - `POST /auth/login` - User authentication
  - `GET /auth/me` - Get current user
  - `GET /waste-collection` - List waste collections
  - `POST /waste-collection` - Create waste collection
  - `GET /recycling-guide` - Get recycling guides
  - `GET /reports` - List reports
  - `POST /reports` - Create report
  - `GET /tasks` - List tasks
  - `PUT /tasks/:id` - Update task
  - `GET /composting/stations` - List composting stations
  - `POST /chatbot/message` - Send chat message
  - `GET /chatbot/history` - Get chat history
  - `GET /user-profile` - Get user profile
  - `PUT /user-profile` - Update user profile
- Request validation: Express-validator middleware for all endpoints
- Response format: Standard success/error envelope format

## Database
- Collections:
  - `users` - User authentication data
  - `customers` - Customer profile information
  - `wastecollections` - Waste collection requests
  - `wasteprocessings` - Waste processing records
  - `compostingstations` - Composting station data
  - `compoststations` - Simplified composting stations
  - `incinerators` - Incinerator facility data
  - `reports` - User-generated reports
  - `reportings` - System reporting data
  - `tasks` - Task management
  - `recyclingguides` - Recycling guide information
  - `chatmessages` - Chatbot conversation history
  - `staff` - Staff member profiles
  - `incineratorusers` - Incinerator operator profiles
- Indexes:
  - `users.email` (unique)
  - `customers.userId`
  - `wastecollections.userId`
  - `wastecollections.status`
  - `tasks.assignedTo`
  - `tasks.status`
  - `reports.userId`
  - `compostingstations.location.coordinates` (2dsphere)
  - `compoststations.location` (2dsphere)
- Writes? (Y/N): Y - Creates/updates users, collections, reports, tasks, chat messages
- Model names and refs:
  - `User` → `Customer` (via userId)
  - `WasteCollection` → `User` (via userId)
  - `Task` → `User` (via assignedTo)
  - `Report` → `User` (via userId)
  - `CompostingStation` → `User` (via manager)

## Environment
- Backend: MONGODB_URI, JWT_SECRET, PORT, NODE_ENV, UPLOAD_PATH, MAX_FILE_SIZE
- Frontend: REACT_APP_API_BASE_URL, REACT_APP_MAP_API_KEY, REACT_APP_UPLOAD_URL
- Uses staging Atlas only

## Checks
- [x] Case-correct imports
- [x] Model registration guards added to key models
- [x] Lint/build pass locally
- [x] Smoke tests provided with curl commands
- [x] Response format standardized to envelope format
- [x] All vendor code preserved in original structure
- [x] Thin adapters created for integration
- [x] Dependency manifests created
- [x] Environment and database manifests created

## Integration Notes
- All existing functionality preserved
- No breaking changes to business logic
- Standard response envelope format implemented
- Mongoose model registration guards added
- Staging database only (no production writes)
- CORS configured for cross-origin requests
- File upload support maintained
- Geospatial queries supported
- JWT authentication integrated
- Role-based access control maintained

## Testing
- Comprehensive smoke tests provided
- All endpoints tested with curl commands
- Error response validation included
- Authentication flow tested
- Database operations verified
- Response format validation included
