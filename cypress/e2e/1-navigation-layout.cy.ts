describe('Navigation and Layout Tests', () => {
  const beforeEachSetup = () => {
    Cypress.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration failed')) {
        return false;
      }
      return true;
    });
  };

  context('Desktop Navigation (1280x720)', () => {
    beforeEach(() => {
      beforeEachSetup();
      cy.viewport(1280, 720);
      cy.visit('/');
    });

    it('should display all navigation elements correctly on the landing page', () => {
      cy.get('header').within(() => {
        cy.contains('ExamGuard').should('be.visible');
        cy.contains('a', 'Entrar').should('be.visible');
        cy.contains('button', 'Cadastro').should('be.visible');
        cy.contains('Upload Vídeo').should('not.exist');
        cy.contains('Upload Streaming').should('not.exist');
      });
    });

    it('should navigate to the login page when "Entrar" is clicked', () => {
      cy.url().should('include', '/');
      cy.contains('a', 'Entrar').click();
      cy.url().should('include', '/login');
      cy.contains('h1', 'Login to your account').should('be.visible');
    });
  });

  context('Mobile Navigation (390x844)', () => {
    beforeEach(() => {
      beforeEachSetup();
      cy.viewport(390, 844);
      cy.visit('/');
    });

    it('should handle mobile menu correctly', () => {
      cy.get('div.hidden.md\\:flex.gap-2').should('not.be.visible');
      cy.get('button[aria-label="Open navigation menu"]').should('be.visible').click();
      cy.get('nav.md\\:hidden').should('be.visible').within(() => {
        cy.contains('a', 'Entrar').should('be.visible');
        cy.contains('button', 'Cadastro').should('be.visible');
      });
      cy.get('button[aria-label="Close navigation menu"]').should('be.visible').click();
      cy.get('nav.md\\:hidden').should('not.exist');
    });
  });
});