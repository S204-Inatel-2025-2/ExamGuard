declare namespace Cypress {
  interface Chainable {
    // Add custom commands here
  }
}

// Import commands.js using ES2015 syntax:
import './commands'

// Enable Testing Library commands
import '@testing-library/cypress/add-commands'