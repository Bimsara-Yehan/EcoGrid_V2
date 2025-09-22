# Environment Variables for Waste Management Subsystem

## Backend Environment Variables

### Required Keys
- `MONGODB_URI` - MongoDB connection string (uses staging Atlas cluster)
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

### Optional Keys
- `UPLOAD_PATH` - Path for file uploads (default: ./uploads)
- `MAX_FILE_SIZE` - Maximum file size for uploads (default: 5MB)

## Frontend Environment Variables

### Required Keys
- `REACT_APP_API_BASE_URL` - Backend API base URL (default: http://localhost:5000)

### Optional Keys
- `REACT_APP_MAP_API_KEY` - API key for map services (if using maps)
- `REACT_APP_UPLOAD_URL` - File upload endpoint URL

## Database Configuration

### Atlas Cluster
- **Environment**: Staging only (no production writes)
- **Database**: EcoGrid_V2
- **Connection**: Uses MongoDB Atlas staging cluster
- **Collections**: All collections are prefixed appropriately

### Security Notes
- All database operations use staging environment
- No production data access or writes
- JWT tokens have 24-hour expiration
- File uploads are restricted to specific directories

## Integration Notes

- Uses shared authentication middleware
- Follows standard response envelope format
- All API endpoints are prefixed with `/api/waste-management/`
- CORS is configured for cross-origin requests
