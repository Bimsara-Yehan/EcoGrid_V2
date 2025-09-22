# Waste Management System - Database Schema

## Collections Used

### 1. waste-customers
- **Purpose**: Store customer information and addresses
- **Indexes**: 
  - `{ userId: 1 }` (unique)
  - `{ "addresses.zoneId": 1 }`
  - `{ activeSubscriptionId: 1 }`

### 2. waste-zones
- **Purpose**: Store zone definitions with polygon coordinates
- **Indexes**:
  - `{ areaType: 1 }`
  - `{ name: 1 }` (unique)
  - `{ "polygon.coordinates": "2dsphere" }` (geospatial)

### 3. waste-subscriptions
- **Purpose**: Store active customer subscriptions
- **Indexes**:
  - `{ customerId: 1 }`
  - `{ zoneId: 1 }`
  - `{ status: 1 }`
  - `{ startedAt: 1 }`

### 4. waste-subscription-plans
- **Purpose**: Store subscription plan templates
- **Indexes**:
  - `{ zoneId: 1 }`
  - `{ active: 1 }`
  - `{ frequency: 1 }`

## Schema Expectations

### Model Names and References
- `WasteCustomer` → `waste-customers` collection
- `WasteZone` → `waste-zones` collection  
- `WasteSubscriptionFinal` → `waste-subscriptions` collection
- `WasteSubscriptionPlan` → `waste-subscription-plans` collection

### Reference Relationships
- Customer.addresses[].zoneId → WasteZone._id
- Zone.customers[] → WasteCustomer._id
- SubscriptionFinal.customerId → WasteCustomer._id
- SubscriptionFinal.zoneId → WasteZone._id
- SubscriptionFinal.planId → WasteSubscriptionPlan._id
- SubscriptionPlan.zoneId → WasteZone._id

## Database Operations

### Writes (Y/N): YES
- **Create**: New customers, zones, subscriptions, plans
- **Update**: Customer details, zone geometry, subscription status
- **Delete**: Remove customers, zones, subscriptions, plans

### Read Operations
- Customer queries with zone filtering
- Zone queries with geospatial operations
- Subscription analytics and reporting
- Dashboard summary aggregations

## Data Validation

### Customer Model
- Required: userId, fullName, addresses[].geo
- Address geo coordinates: [longitude, latitude]
- Ecopoints: numeric balance and transaction history

### Zone Model
- Required: name, areaType, polygon
- Polygon: GeoJSON Polygon format
- AreaType: enum ["Urban", "Rural", "Suburban"]

### Subscription Model
- Required: customerId, zoneId, planId, status, startedAt
- Status: enum ["active", "paused", "cancelled"]
- Discounts: array of discount objects

## Performance Considerations

- Geospatial indexes for zone queries
- Compound indexes for subscription filtering
- Proper indexing on frequently queried fields
- Collection-level validation rules
