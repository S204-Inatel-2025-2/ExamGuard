describe('Home Page Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display all static content correctly', () => {
    cy.contains('h1', 'ExamGuard').should('be.visible')
    cy.contains('Assistente Computacional Anti-trapaça').should('be.visible')
    cy.contains('Monitoramento em tempo real').should('be.visible')
    cy.contains('Relatórios inteligentes').should('be.visible')
  })

  it('should handle CTA buttons correctly', () => {
    cy.contains('button', 'Entrar').click()
    cy.url().should('include', '/login')
    cy.visit('/')
    cy.contains('button', 'Cadastro').click()
    cy.url().should('include', '/login')
  })
})