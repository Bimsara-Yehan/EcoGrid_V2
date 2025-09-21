# Environment Variables for Incineration Subsystem

## Backend Environment Variables

### Required
- `MONGODB_URI` - MongoDB Atlas connection string (staging cluster only)
- `PORT` - Server port (default: 5000)

### Optional
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - CORS allowed origins

## Frontend Environment Variables

### Required
- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:5000)

### Optional
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version

## Database Configuration

- **Uses staging Atlas cluster only** - No production writes
- **Database**: EcoGrid_V2
- **Collections**: waste_logs
- **Connection**: MongoDB Atlas with retryWrites and majority write concern

## AI Service Integration

### AI Service Environment Variables
- **AI_SERVICE_HOST** - AI service host (default: localhost)
- **AI_SERVICE_PORT** - AI service port (default: 8000)
- **AI_SERVICE_URL** - Full AI service URL (default: http://localhost:8000)

### AI Service Configuration
- **AI Service URL**: http://localhost:8000 (if running locally)
- **Endpoints**: /predict, /health, /recommend
- **CORS**: Enabled for frontend integration
- **Models**: Located in `backend/vendor/incineration/ai-service/models/`
- **Requirements**: `backend/vendor/incineration/ai-service/requirements.txt`
- **Vendor Location**: `backend/vendor/incineration/ai-service/` (unchanged)

### AI Service Dependencies
- **Python**: 3.8+
- **FastAPI**: Web framework
- **Scikit-learn**: ML models
- **Pandas**: Data processing
- **Joblib**: Model serialization
- **Dependencies File**: `backend/deps.incineration.ai.json`

## Security Notes

- All API calls use HTTPS in production
- CORS configured for specific origins
- Environment variables loaded from .env files
- No sensitive data in frontend code
