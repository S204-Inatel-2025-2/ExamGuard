describe("Home Page Tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should display all static content correctly", () => {
    cy.contains("h1", "ExamGuard").should("be.visible");
    cy.contains("p", "Assistente Computacional Anti-trapaça").should(
      "be.visible",
    );
    cy.contains("h3", "Monitoramento em tempo real").should("be.visible");
    cy.contains("h3", "Relatórios inteligentes").should("be.visible");
  });

  it("should handle CTA buttons correctly", () => {
    cy.contains("a", "Entrar").should("be.visible").click();
    cy.url().should("include", "/login");
    cy.contains("h1", "Login to your account").should("be.visible");
  });
});
