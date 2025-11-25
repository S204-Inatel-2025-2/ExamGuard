import "./commands";
import "cypress-axe";

Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("Minified React error #418") ||
    err.message.includes("Minified React error #423")
  ) {
    return false;
  }
  return true;
});
