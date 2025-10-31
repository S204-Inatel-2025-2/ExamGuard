describe('Video Upload Tests', () => {
  beforeEach(() => {
    cy.visit('/dashboard/upload-video');
  });

  it('should display initial upload page state', () => {
    cy.contains('h2', 'Upload de Vídeo').should('be.visible');
    cy.get('[data-testid="upload-area"]').should('be.visible');
    cy.contains('Clique para selecionar um vídeo').should('be.visible');
    cy.get('video').should('not.exist');
    cy.contains('button', 'Enviar Vídeo').should('be.disabled');
  });

});