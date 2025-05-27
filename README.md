# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/ca2c70bd-e401-469b-a10b-c35b76f5fbe1

## API Integration

This project includes a complete authentication system with the following endpoints:

### Register Endpoint
- **URL**: `POST /api/v1/auth/register`
- **Purpose**: Register a new user with email and password. An OTP verification email will be sent.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "stringst",
  "username": "string",
  "full_name": "string"
}
```

**Success Response (201):**
```json
{
  "user_id": "string",
  "email": "user@example.com",
  "message": "string"
}
```

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["string", 0],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### Frontend Implementation
The registration functionality is implemented in:
- `src/lib/api.ts` - API client and types
- `src/hooks/useAuth.ts` - React hooks for authentication
- `src/pages/Index.tsx` - Login/signup form with validation

### Configuration
1. Copy `.env.example` to `.env`
2. Set `VITE_API_BASE_URL` to your backend URL (default: `http://localhost:8000`)

### Features
- ✅ Form validation (email format, password strength, field matching)
- ✅ Loading states with spinner
- ✅ Error handling with detailed messages
- ✅ Success notifications
- ✅ Responsive design
- ✅ TypeScript support

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/ca2c70bd-e401-469b-a10b-c35b76f5fbe1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/ca2c70bd-e401-469b-a10b-c35b76f5fbe1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
