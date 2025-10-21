describe('Navigation and Layout Tests', () => {
  describe('Desktop Navigation', () => {
    beforeEach(() => {
      cy.viewport(1280, 720)
      cy.visit('/')
    })

    it('should display all navigation elements correctly', () => {
      cy.get('nav').within(() => {
        cy.contains('ExamGuard').should('be.visible')
        cy.contains('Sobre').should('be.visible')
        cy.contains('Upload Vídeo').should('be.visible')
        cy.contains('Upload Streaming').should('be.visible')
        cy.contains('Entrar').should('be.visible')
      })
    })

    it('should navigate through all main sections', () => {
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.contains('Sobre').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      cy.contains('Upload Vídeo').click()
      cy.url().should('include', '/upload-video')
      cy.contains('Upload Streaming').click()
      cy.url().should('include', '/upload-streaming')
      cy.contains('Entrar').click()
      cy.url().should('include', '/login')
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport(390, 844)
      cy.visit('/')
    })

    it('should handle mobile menu correctly', () => {
      cy.get('[aria-label="Menu"]').should('be.visible').click()
      cy.contains('Sobre').should('be.visible')
      cy.contains('Upload Vídeo').should('be.visible')
      cy.contains('Upload Streaming').should('be.visible')
      cy.contains('Upload Vídeo').click()
      cy.url().should('include', '/upload-video')
      cy.contains('Upload Vídeo').should('not.be.visible')
      cy.get('[aria-label="Menu"]').click()
      cy.get('[aria-label="Fechar"]').should('be.visible').click()
      cy.contains('Upload Vídeo').should('not.be.visible')
    })
  })
})