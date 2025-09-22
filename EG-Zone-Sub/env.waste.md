# Waste Management System - Environment Configuration

## Backend Environment Variables

### Required Variables
- `MONGODB_URI` - MongoDB connection string (staging Atlas cluster only)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/staging/production)

### Example .env
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waste-staging?retryWrites=true&w=majority
PORT=5000
NODE_ENV=staging
```

## Frontend Environment Variables

### Required Variables
- `VITE_API_BASE_URL` - Backend API base URL

### Example .env
```
VITE_API_BASE_URL=http://localhost:5000
```

## Database Configuration

- **Uses staging Atlas cluster only** - No production database writes
- **Collections**: waste-customers, waste-zones, waste-subscriptions, waste-subscription-plans
- **Connection**: MongoDB Atlas with proper authentication

## Security Notes

- All database operations use staging environment
- No production data access
- Environment variables are properly scoped
