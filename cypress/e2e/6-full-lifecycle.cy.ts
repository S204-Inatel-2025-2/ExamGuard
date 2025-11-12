describe('Ciclo Completo do Usuário', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/login', { statusCode: 200, body: { token: 'fake-jwt-token' } }).as('loginRequest');
    cy.intercept('POST', '**/register', { statusCode: 201, body: { message: 'User created' } }).as('registerRequest');
    cy.visit('/');
  });

  it('permite que um usuário se registre, faça login e visualize o dashboard', () => {
    cy.contains('button', 'Cadastro').click();
    cy.url().should('include', '/login');

    cy.get('input[name="name"]').type('Test User');
    cy.get('input[name="email"]').type('test.user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('button', 'Create account').click();

    cy.wait('@registerRequest');

    cy.contains('h1', 'Login to your account').should('be.visible');
    cy.get('input[name="email"]').type('test.user@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('button', 'Login').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/dashboard');
    cy.contains('h1', 'Dashboard').should('be.visible');
  });
});