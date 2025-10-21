describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  describe('Login Form', () => {
    it('should validate empty form submission', () => {
      cy.get('form').within(() => {
        cy.get('input[type="email"]').should('be.visible')
        cy.get('input[type="password"]').should('be.visible')
        cy.contains('button', 'Login').should('be.visible')
        cy.contains('Login with GitHub').should('be.visible')
      })
      cy.contains('button', 'Login').click()
      cy.get('input[type="email"]:invalid').should('exist')
    })

    it('should handle form input validation', () => {
      cy.get('input[type="email"]').type('invalid-email')
      cy.get('input[type="password"]').type('123')
      cy.contains('button', 'Login').click()
      cy.get('input[type="email"]:invalid').should('exist')
    })
  })

  describe('Form Toggle', () => {
    it('should switch between login and register forms', () => {
      cy.contains('Login').should('be.visible')
      cy.contains('Sign up').click()
      cy.get('form').within(() => {
        cy.get('input[placeholder*="Name"]').should('be.visible')
        cy.get('input[type="email"]').should('be.visible')
        cy.get('input[type="password"]').should('be.visible')
        cy.contains('button', 'Create account').should('be.visible')
      })
      cy.contains('Sign in').click()
      cy.contains('Login').should('be.visible')
      cy.get('input[placeholder*="Name"]').should('not.exist')
    })

    it('should preserve form inputs when switching', () => {
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('password123')
      cy.contains('Sign up').click()
      cy.contains('Sign in').click()
      cy.get('input[type="email"]').should('have.value', 'test@example.com')
      cy.get('input[type="password"]').should('have.value', 'password123')
    })
  })
})