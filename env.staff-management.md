# Staff Management Environment Configuration

## Backend Environment Variables

### Required Keys
- `MONGODB_URI` - MongoDB connection string (staging Atlas only)
- `JWT_SECRET` - Secret key for JWT token generation
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/staging/production)

### Optional Keys
- `EMAIL_HOST` - SMTP host for email notifications
- `EMAIL_PORT` - SMTP port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASS` - SMTP password
- `FRONTEND_URL` - Frontend URL for CORS

## Frontend Environment Variables

### Required Keys
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:3001)

### Optional Keys
- `REACT_APP_ENV` - Environment (development/staging/production)

## Database Configuration

### Staging Atlas Only
- ✅ Uses staging MongoDB Atlas cluster
- ❌ No production database writes
- ✅ All operations against staging environment

## Security Notes
- JWT tokens for authentication
- CORS configured for frontend domain
- Input validation on all endpoints
- No sensitive data in environment variables
