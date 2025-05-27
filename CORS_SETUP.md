# CORS Setup and Configuration

## Understanding the CORS Error

The CORS error occurs because your frontend (`https://bitewise-delta.vercel.app`) is trying to make requests to your backend (`https://bitewise-backend.onrender.com`) from a different domain, which browsers block by default for security.

## Solutions

### 1. Backend Configuration (Recommended)

Configure your backend to allow requests from your frontend domain. Add these headers to your backend responses:

```
Access-Control-Allow-Origin: https://bitewise-delta.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

#### For FastAPI (Python):
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bitewise-delta.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### For Express.js (Node.js):
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://bitewise-delta.vercel.app',
  credentials: true
}));
```

### 2. Development Setup

For local development, this project is configured with a Vite proxy that forwards API requests to the backend, avoiding CORS issues.

#### Environment Variables

Create a `.env` file in the project root with:

```
# Leave empty for development (uses proxy)
VITE_API_BASE_URL=

# For production deployment, set this to:
# VITE_API_BASE_URL=https://bitewise-backend.onrender.com
```

#### Development Server

The Vite proxy is configured in `vite.config.ts` to forward `/api/*` requests to `https://bitewise-backend.onrender.com`.

### 3. Production Deployment (Vercel)

The `vercel.json` configuration handles two important issues:

1. **API Proxying**: Forwards `/api/*` requests to your backend
2. **SPA Routing**: Serves `index.html` for all routes so React Router works

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://bitewise-backend.onrender.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

## Issues Fixed

### CORS Error
- **Problem**: Frontend couldn't access backend due to missing CORS headers
- **Solution**: Vercel proxy with CORS headers OR backend CORS configuration

### 404 Errors on Routes
- **Problem**: Direct navigation to `/dashboard` returned 404
- **Solution**: Added SPA rewrite rule to serve `index.html` for all routes

## Current Configuration

- **Development**: Uses Vite proxy (no CORS issues)
- **Production**: Uses Vercel proxy and SPA routing
- **API Base URL**: Automatically determined based on environment
- **React Router**: All routes properly handled by client-side routing

## Testing

1. Start development server: `npm run dev`
2. Try logging in - should work without CORS errors
3. Navigate to `/dashboard` directly - should work without 404 errors
4. For production, deploy to Vercel with the current `vercel.json` configuration 