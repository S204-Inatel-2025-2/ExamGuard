/// <reference types="cypress" />

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  "login",
  (email: string = "test@example.com", password: string = "password123") => {
    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.contains("button", "Login").click();
    cy.url().should("include", "/dashboard");
  },
);

export {};
