describe('Auditorias de Acessibilidade', () => {
  const pagesToTest = ['/', '/login', '/dashboard', '/dashboard/upload-video', '/dashboard/upload-streaming'];

  beforeEach(() => {
    cy.injectAxe();
  });

  pagesToTest.forEach((page) => {
    it(`não deve ter violações de acessibilidade detectáveis na página ${page}`, () => {
      if (page.includes('dashboard')) {
        cy.intercept('POST', '**/login', { statusCode: 200, body: { token: 'fake-jwt-token' } });
        cy.login();
      } else {
        cy.visit(page);
      }
      
      cy.checkA11y();
    });
  });

  it('não deve ter violações de acessibilidade no Dashboard', () => {
    cy.intercept('POST', '**/login', { statusCode: 200, body: { token: 'fake-jwt-token' } });
    cy.login();
    cy.checkA11y();
  });
});