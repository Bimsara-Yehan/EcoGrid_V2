# Waste Management System Integration

## Domain
waste — base path `/api/waste`

## What's included
- **Vendor code**: `backend/vendor/waste/...`, `frontend/src/vendor/waste/...` (unchanged)
- **Router adapter**: `backend/routes/wasteRoutes.js` (exports Express router)
- **Page adapter**: `frontend/src/pages/Waste.tsx`
- **Service adapter**: `frontend/src/services/waste.ts`
- **Dependencies**: `backend/deps.waste.json`, `frontend/deps.waste.json`
- **Env manifest**: `env.waste.md`
- **DB manifest**: `db.waste.md`
- **Smoke tests**: `waste-smoke-tests.md`

## API Endpoints
- **Base path**: `/api/waste`
- **Endpoints and methods**:
  - `GET /customers` - List all customers
  - `GET /customers/:id` - Get customer by ID
  - `POST /customers` - Create new customer
  - `PUT /customers/:id` - Update customer
  - `DELETE /customers/:id` - Delete customer
  - `GET /zones` - List all zones
  - `GET /zones/:id` - Get zone by ID
  - `POST /zones` - Create new zone
  - `PUT /zones/:id` - Update zone
  - `DELETE /zones/:id` - Delete zone
  - `GET /zones/:id/customers` - Get customers for zone
  - `PUT /zones/:id/geometry` - Update zone geometry
  - `GET /subscriptions` - List all subscription plans
  - `GET /subscriptions/:id` - Get subscription plan by ID
  - `POST /subscriptions` - Create new subscription plan
  - `PUT /subscriptions/:id` - Update subscription plan
  - `DELETE /subscriptions/:id` - Delete subscription plan
  - `GET /subscriptions/zone/:zoneId` - Get subscriptions by zone
  - `GET /summary` - Get dashboard summary data

- **Request validation**: Mongoose schema validation
- **Response format**: Standardized success/error envelope

## Database
- **Collections**:
  - `waste-customers` - Customer information and addresses
  - `waste-zones` - Zone definitions with polygon coordinates
  - `waste-subscriptions` - Active customer subscriptions
  - `waste-subscription-plans` - Subscription plan templates
- **Indexes**:
  - Geospatial indexes for zone queries
  - Compound indexes for subscription filtering
  - Customer and zone reference indexes
- **Writes?**: YES (Create, Update, Delete operations)
- **Model names and refs**:
  - `WasteCustomer` → `waste-customers`
  - `WasteZone` → `waste-zones`
  - `WasteSubscriptionFinal` → `waste-subscriptions`
  - `WasteSubscriptionPlan` → `waste-subscription-plans`

## Environment
- **Backend**: MONGODB_URI, PORT, NODE_ENV
- **Frontend**: VITE_API_BASE_URL
- **Uses staging Atlas only** ✅

## Checks
- [x] Case-correct imports
- [x] Model registration guards
- [x] Collection names prefixed with 'waste-'
- [x] Standardized response format
- [x] Error handling with proper codes
- [x] Smoke tests provided
- [x] Dependencies documented
- [x] Environment requirements documented

## Features Included
- **Customer Management**: CRUD operations for customers
- **Zone Management**: CRUD operations for service zones with geospatial data
- **Subscription Management**: CRUD operations for subscription plans
- **Dashboard Analytics**: Customer coverage, zone distribution, revenue tracking
- **Map Integration**: React Leaflet integration for zone visualization
- **Real-time Updates**: Customer coverage calculation and zone statistics

## Integration Notes
- All vendor code preserved in original structure
- Thin adapters provide clean integration
- No modifications to existing business logic
- Ready for multi-tenant integration with other subsystems
