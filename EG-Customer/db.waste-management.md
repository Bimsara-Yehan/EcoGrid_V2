# Database Schema for Waste Management Subsystem

## Collections Used

### Core Collections
- `users` - User authentication and basic profile data
- `customers` - Extended customer profile information
- `staff` - Staff member profiles
- `incineratorusers` - Incinerator operator profiles

### Waste Management Collections
- `wastecollections` - Waste collection requests and records
- `wasteprocessings` - Waste processing operations
- `compostingstations` - Composting station locations and data
- `compoststations` - Simplified composting station data
- `incinerators` - Incinerator facility information

### Reporting Collections
- `reports` - User-generated reports
- `reportings` - System reporting data
- `tasks` - Task management and assignments

### Support Collections
- `recyclingguides` - Recycling guide information
- `chatmessages` - Chatbot conversation history

## Indexes

### Required Indexes
- `users.email` - Unique index for user authentication
- `customers.userId` - Index for user profile lookups
- `wastecollections.userId` - Index for user's collection requests
- `wastecollections.status` - Index for collection status filtering
- `tasks.assignedTo` - Index for task assignments
- `tasks.status` - Index for task status filtering
- `reports.userId` - Index for user reports
- `compostingstations.location.coordinates` - Geospatial index for location queries

### Geospatial Indexes
- `compostingstations.location.coordinates` - 2dsphere index for location-based queries
- `compoststations.location` - 2dsphere index for location-based queries

## Schema Expectations

### Model Names and References
- `User` model references `Customer` via `userId`
- `WasteCollection` references `User` via `userId`
- `Task` references `User` via `assignedTo`
- `Report` references `User` via `userId`
- `CompostingStation` references `User` via `manager`

### Collection Names
- All collections use exact names as defined in models
- No automatic pluralization - collections match model names exactly
- Case-sensitive collection names

## Write Operations

### Create Operations
- User registration creates `User` and `Customer` records
- Waste collection requests create `WasteCollection` records
- Reports create `Report` records
- Tasks create `Task` records
- Chat messages create `ChatMessage` records

### Update Operations
- User profiles update `Customer` records
- Task status updates `Task` records
- Collection status updates `WasteCollection` records
- Report status updates `Report` records

### Delete Operations
- Soft deletes for most records (using `isActive` flag)
- Hard deletes only for test data cleanup
- No cascade deletes - manual cleanup required

## Data Validation

### Required Fields
- All models have required field validation
- Email addresses are validated and normalized
- Location coordinates are validated for geospatial queries
- File uploads are validated for type and size

### Constraints
- Unique email addresses across all user types
- Valid coordinate ranges for location data
- File size limits for uploads
- Status values must match predefined enums

## Staging Environment

- **Database**: EcoGrid_V2 (staging)
- **Cluster**: MongoDB Atlas staging cluster
- **Access**: Read/write access to staging only
- **Backup**: Regular backups enabled
- **Monitoring**: Query performance monitoring active
