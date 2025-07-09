# End-to-End Testing with Cypress

This directory contains E2E tests for the Bitewise application, specifically focusing on the login functionality.

## Setup

The E2E tests are already configured and ready to run. Cypress has been installed as a dev dependency.

## Running the Tests

### Prerequisites

1. Make sure the frontend development server is running:
   ```bash
   npm run dev
   ```
   The app should be accessible at `http://localhost:8080`

2. Ensure the backend API is running and accessible

### Running Tests

1. **Interactive Mode (Cypress UI):**
   ```bash
   npm run e2e:open
   ```
   This opens the Cypress Test Runner where you can see tests executing in real-time.

2. **Headless Mode (CLI):**
   ```bash
   npm run e2e
   ```
   Runs all tests in the terminal without opening a browser window.

3. **Headed Mode (CLI with Browser):**
   ```bash
   npm run e2e:headed
   ```
   Runs tests in CLI but shows the browser window.

## Test Coverage

### Login Functionality (`login.cy.ts`)

The E2E tests cover the following scenarios:

#### ✅ **Successful Login**
- Login with valid credentials (`aaniksahaa.2001@gmail.com` / `anik1234`)
- Handles both direct login and OTP verification flow
- Verifies proper navigation after successful authentication

#### ❌ **Failed Login Attempts**
- Invalid email address
- Invalid password
- Empty form fields
- Proper error message display

#### 🔧 **Form Interactions**
- Password visibility toggle
- Navigation between login and signup forms

#### 🔗 **Navigation & URL Handling**
- Redirect to dashboard after successful login
- URL remains on login page for failed attempts

## Test Data

Test credentials and data are stored in `cypress/fixtures/users.json`:
- Valid user: `aaniksahaa.2001@gmail.com` / `anik1234`
- Invalid user credentials for testing failure scenarios

## Configuration

- **Base URL:** `http://localhost:8080`
- **Viewport:** 1280x720
- **Timeouts:** 10 seconds default, up to 20 seconds for navigation
- **Screenshots:** Captured on test failures
- **Videos:** Disabled by default

## Custom Commands

The tests use custom Cypress commands defined in `cypress/support/commands.ts`:
- `cy.login(email, password)` - Performs login action
- `cy.interceptLogin()` - Intercepts login API calls for mocking

## Troubleshooting

1. **Tests failing due to server not running:**
   - Ensure `npm run dev` is running in another terminal
   - Check that the app loads at `http://localhost:8080`

2. **API-related failures:**
   - Verify backend is running and accessible
   - Check network requests in Cypress UI for debugging

3. **Timeout issues:**
   - Increase timeout values in `cypress.config.ts` if needed
   - Check for slow network responses

## Adding New Tests

1. Create new test files in `cypress/e2e/` with `.cy.ts` extension
2. Follow the existing patterns and use custom commands
3. Add test data to `cypress/fixtures/` as needed
4. Update this README with new test scenarios 