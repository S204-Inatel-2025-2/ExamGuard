describe('Streaming Video Tests', () => {
  beforeEach(() => {
    cy.visit('dashboard/upload-streaming')
  })

  it('should display initial streaming page state', () => {
    cy.contains('Gravar Aula').should('be.visible')
    cy.contains('Câmera desligada').should('be.visible')
    cy.contains('Iniciar Gravação').should('be.enabled')
    cy.contains('Parar Gravação').should('not.exist')
  })
})