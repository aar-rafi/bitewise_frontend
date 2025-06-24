# Backend Google OAuth Requirements

## Overview
Frontend handles ALL redirects. Backend only returns JSON responses.

## Required Endpoints

### 1. GET `/api/v1/auth/google/login`

**Query Parameters:**
- `redirect_uri` (string, required) - Frontend callback URL

**Response (JSON):**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=...&state=...",
  "state": "random_security_string"
}
```

**Implementation:**
- Generate Google OAuth URL with your client_id, scopes, and state
- `redirect_uri` should match what's registered in Google Cloud Console
- Return authorization URL as JSON (do NOT redirect)

### 2. POST `/api/v1/auth/google/callback`

**Request Body:**
```json
{
  "code": "authorization_code_from_google",
  "state": "state_parameter_for_verification"
}
```

**Response (JSON):**
```json
{
  "access_token": "your_jwt_token",
  "refresh_token": "your_refresh_token",
  "user_id": "123",
  "email": "user@example.com", 
  "username": "user123",
  "expires_in": 3600,
  "token_type": "Bearer",
  "provider": "google",
  "first_login": true,
  "profile_complete": false,
  "is_new_user": true
}
```

**Implementation:**
- Verify state parameter matches what you generated
- Exchange code with Google for user info
- Create/update user in your database
- Generate your app's JWT tokens
- Return user info + tokens as JSON

## Google Cloud Console Setup

**Authorized redirect URIs must include:**
- `http://localhost:8080/auth/google/callback` (development)
- `https://yourdomain.com/auth/google/callback` (production)

## Environment Variables Needed
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback
```

## Key Points
- ✅ Backend returns JSON only, never redirects browsers
- ✅ Frontend handles all user redirects  
- ✅ Use standard OAuth2 flow
- ✅ Verify state parameter for security
- ✅ Generate your own JWT tokens for user sessions 