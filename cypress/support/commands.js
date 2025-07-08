// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to perform login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/')
  
  // Wait for the page to load completely
  cy.get('body').should('be.visible')
  cy.wait(2000) // Wait for dynamic content
  
  // Ensure we're on login form (not signup)
  cy.get('body').then(($body) => {
    if ($body.text().includes('Create Account') || $body.text().includes('Sign Up')) {
      cy.contains('button', 'Sign In').click()
      cy.wait(1000)
    }
  })
  
  // Wait for and fill email field
  cy.get('input[type="email"]').should('be.visible').clear().type(email)
  
  // Use the specific ID selector and force the interaction for password
  cy.get('#password')
    .clear({ force: true })
    .type(password, { force: true })
  
  // Submit the form
  cy.get('button[type="submit"]').should('be.visible').click()
})

// Custom command to intercept login API calls
Cypress.Commands.add('interceptLogin', () => {
  // Intercept successful login (direct login - no OTP)
  cy.intercept('POST', '/api/v1/auth/login', {
    statusCode: 200,
    body: {
      access_token: 'mock_access_token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock_refresh_token',
      user_id: '123',
      message: 'Login successful - welcome back!',
      otp_required: false
    }
  }).as('loginSuccess')
  
  // Intercept failed login
  cy.intercept('POST', '/api/v1/auth/login', {
    statusCode: 401,
    body: {
      detail: 'Incorrect email or password'
    }
  }).as('loginFailure')
}) 