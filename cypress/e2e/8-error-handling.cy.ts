describe('Tratamento de Erros de Autenticação', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('deve exibir uma mensagem de erro ao falhar o login (401 Não Autorizado)', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('failedLogin');

    cy.get('input[name="email"]').type('wrong@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.contains('button', 'Login').click();

    cy.wait('@failedLogin');

    cy.contains('Suas credenciais não batem com nenhuma dos nossos servidores. Tente novamente.').should('be.visible');
  });

  it('deve exibir uma mensagem de erro genérica do servidor (500)', () => {
    cy.intercept('POST', '**/login', {
      statusCode: 500,
      body: { message: 'Internal Server Error' },
    }).as('serverError');

    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.contains('button', 'Login').click();

    cy.wait('@serverError');

    cy.contains('Erro desconhecido. Contate o suporte.').should('be.visible');
  });
});