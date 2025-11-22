/// <reference types="cypress" />

Cypress.Commands.add(
  "login",
  (email = "test@example.com", password = "password123") => {
    cy.visit("/login");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.contains("button", "Login").click();
    cy.url().should("include", "/dashboard");
  },
);
