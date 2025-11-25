describe("Authentication Flow Tests", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  context("Form Display and Toggle", () => {
    it("should display the login form by default", () => {
      cy.contains("h1", "Login to your account").should("be.visible");
      cy.contains("button", "Login").should("be.visible");
      cy.get('input[name="name"]').should("not.exist");
    });

    context("Form Validation", () => {
      it("should trigger browser validation for empty form submission", () => {
        cy.contains('button[type="submit"]', "Login").click();
        cy.url().should("include", "/login");
        cy.get('input[type="email"]:invalid').should("have.length", 1);
        cy.get('input[type="email"]')
          .should("be.enabled")
          .type("test@example.com");
        cy.contains('button[type="submit"]', "Login").click();
        cy.get('input[type="password"]:invalid').should("have.length", 1);
      });
    });
  });
});
