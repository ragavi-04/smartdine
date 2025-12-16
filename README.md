# SmartDine - AI Restaurant Discovery Platform

An intelligent restaurant recommendation system powered by AI that understands natural language queries and provides personalized suggestions based on mood, preferences, and context.

## Features

- Natural Language Search with AI-powered recommendations
- Interactive Map View with geolocation
- User Authentication & Personalization
- Review & Rating System
- Favorites & Search History
- Advanced Filtering (Allergies, Diet, Weather, Price, etc.)
- Weather-based Recommendations
- Real-time Restaurant Discovery

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS, React Router, Leaflet.js  
**Backend:** Node.js, Express.js, MongoDB, JWT Authentication  
**AI/ML:** Groq API (Llama 3.3), Custom RAG, Vector Embeddings  
**APIs:** OpenWeather API, Google Maps Integration

## Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Groq API key

## Setup

### Backend Setup
```bash
cd server
npm install
```

Create `.env` file in `server` folder:
```
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```

StarFrontend Setup
```bash
cd client
npm install
npm run dev
```

Access atuster
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string

### Groq API
1. Go to https://console.groq.com/
2. Sign up (free)
3. Environment Variables

Create `.env` in server folder:
```
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=your_secret_key
PORT=5000
```rise me feature
API Endpoints

**Restaurants:** `/api/restaurants` - GET, GET/:id, GET/random, GET/map, POST/nearby  
**Search:** `/api/search` - POST, GET/surprise, POST/exclude-ingredients  
**Auth:** `/api/auth` - POST/register, POST/login, GET/me, PUT/update-profile  
**Reviews:** `/api/reviews` - POST, GET/restaurant/:id, PUT/:id, DELETE/:id
```javascript
{
  name: String,
  cuisine: [String],
  priceRange: String,
  location: String,
  sKey Features

- **AI Search:** Natural language understanding with Groq LLM
- **Smart Filtering:** Allergies, dietary restrictions, weather-based suggestions
- **User System:** JWT authentication, favorites, reviews, preferences
- **Interactive Map:** Leaflet.js with geolocation and directions
- **Personalization:** Search history, user preferences, tailored recommendationsd '{"query": "something cheesy but cheap"}'

# Surprise me
curl http://localhost:5000/api/search/surprise
```

## 🚢 Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repo
4. Add environment variables
5. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Project Structure

```
smartdine/
├── server/          # Express.js backend
│   ├── controllers/ # Business logic
│   ├── models/      # MongoDB schemas
│   ├── routes/      # API routes
│   └── services/    # AI & external services
└── client/          # React frontend
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

## License

MIT