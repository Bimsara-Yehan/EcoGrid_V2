# Database Configuration for Incineration Subsystem

## Collections Used

### waste_logs
- **Purpose**: Stores waste incineration logs with AI predictions
- **Model**: WasteLog (Mongoose model)
- **Location**: `backend/vendor/incineration/models/WasteLog.js`

## Schema Structure

### WasteLog Document
```javascript
{
  _id: ObjectId,
  date: Date,
  weight: Number,
  category: String,
  location: String,
  status: String,
  composition: {
    paper_pct: Number,
    plastic_pct: Number,
    organic_pct: Number,
    moisture_pct: Number
  },
  energyProduced: Number,
  emissions: Number,
  ai_recommendation_accepted: Boolean,
  ai_predicted_energy: Number,
  ai_predicted_emissions: Number,
  ai_airflow: Number,
  ai_grate_speed: Number,
  ai_feed_rate: Number,
  ai_o2_target: Number,
  ai_burner_temp: Number,
  ai_accepted_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Recommended Indexes
- `{ date: 1 }` - For date-based queries
- `{ category: 1 }` - For category filtering
- `{ status: 1 }` - For status filtering
- `{ ai_recommendation_accepted: 1 }` - For AI analytics
- `{ createdAt: 1 }` - For creation time queries

## Database Operations

### Reads
- Daily reports aggregation
- Monthly analytics aggregation
- Individual log retrieval
- Filtered queries by date, category, status

### Writes
- **Create**: New waste log entries
- **Update**: AI recommendation acceptance
- **Delete**: Log removal (if needed)

### No Writes to Other Collections
- This subsystem only reads/writes to `waste_logs`
- No cross-collection dependencies

## Model Registration

### Mongoose Model Guard
```javascript
const WasteLog = mongoose.models.WasteLog || mongoose.model('WasteLog', wasteLogSchema);
```

## Database Connection

- **Atlas Cluster**: EcoGrid_V2
- **Connection String**: mongodb+srv://...
- **Write Concern**: majority
- **Retry Writes**: true
- **App Name**: Cluster0

## AI Service Integration

### AI Service Database Interaction
- **No Direct DB Access**: AI service doesn't directly access database
- **API Integration**: Communicates with backend via HTTP API
- **Data Flow**: Frontend → Backend → AI Service → Backend → Database
- **Models**: ML models stored in `backend/vendor/incineration/ai-service/models/`
- **Training Data**: `backend/vendor/incineration/ai-service/data/waste_logs.csv`

## Data Validation

- Weight: positive number
- Percentages: 0-100 range
- Dates: valid Date objects
- Categories: predefined enum values
- Status: predefined enum values
