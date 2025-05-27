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

### 3. Production Deployment

For production (Vercel), you have two options:

1. **Configure CORS on backend** (recommended)
2. **Use Vercel rewrites** in `vercel.json`:

```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://bitewise-backend.onrender.com/api/$1"
    }
  ]
}
```

## Current Configuration

- **Development**: Uses Vite proxy (no CORS issues)
- **Production**: Requires backend CORS configuration
- **API Base URL**: Automatically determined based on environment

## Testing

1. Start development server: `npm run dev`
2. Try logging in - should work without CORS errors
3. For production, ensure backend CORS is configured before deploying 