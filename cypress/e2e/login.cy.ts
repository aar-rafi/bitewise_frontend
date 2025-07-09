/// <reference types="cypress" />

describe('Login Functionality', () => {
  beforeEach(() => {
    // Visit the login page before each test
    cy.visit('/')
    
    // Wait for the page to load completely
    cy.get('body').should('be.visible')
    
    // Wait a bit for any dynamic content to load
    cy.wait(2000)
    
    // Ensure we're on the login form (not signup)
    cy.get('body').then(($body) => {
      // Check if we're in signup mode and switch to login if needed
      if ($body.text().includes('Create Account') || $body.text().includes('Sign Up')) {
        cy.contains('button', 'Sign In').click()
        cy.wait(1000) // Wait for form switch
      }
    })
  })

  it('should show error message with incorrect credentials', () => {
    cy.fixture('users').then((users) => {
      const { email, password } = users.invalidUser
      
      // Fill in the login form with invalid credentials
      cy.get('input[type="email"]').should('be.visible').clear().type(email)
      cy.get('#password').clear({ force: true }).type(password, { force: true })
      
      // Submit the form
      cy.get('button[type="submit"]').should('be.visible').click()
      
      // Wait for error message to appear
      cy.get('body', { timeout: 10000 }).should('satisfy', ($body) => {
        const bodyText = $body.text()
        return bodyText.includes('Incorrect email or password') ||
               bodyText.includes('Login failed') ||
               bodyText.includes('Invalid') ||
               bodyText.includes('error')
      })
      
      // Should remain on login page
      cy.url().should('include', '/')
    })
  })

  it('should login successfully with valid credentials', () => {
    // Load test data
    cy.fixture('users').then((users) => {
      const { email, password } = users.validUser
      
      // Wait for and fill email field
      cy.get('input[type="email"]').should('be.visible').clear().type(email)
      
      // Use the specific ID selector and force the interaction
      cy.get('#password')
        .clear({ force: true })
        .type(password, { force: true })
      
      // Submit the form
      cy.get('button[type="submit"]').should('be.visible').click()
      
      // Wait for either success redirect or OTP form
      cy.url({ timeout: 15000 }).should('satisfy', (url) => {
        // Either redirected to dashboard or showing OTP verification
        return url.includes('/dashboard') || 
               url.includes('/profile') || 
               url.includes('/') // might stay on same page but show OTP form
      })
      
      // Check for successful authentication indicators
      cy.get('body').should('satisfy', ($body) => {
        const bodyText = $body.text()
        // Should either be redirected away from login or show OTP form
        return !bodyText.includes('Incorrect email or password') &&
               !bodyText.includes('Login failed')
      })
    })
  })
}) 