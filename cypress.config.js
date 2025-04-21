const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Updated to match Vite dev server
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.js',
  },
});
