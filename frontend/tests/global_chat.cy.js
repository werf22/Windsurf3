// cypress/e2e/global_chat.cy.js
// E2E test for the Global AI Chat feature

describe('Global AI Chat', () => {
  beforeEach(() => {
    // Adjust login if your app requires authentication
    cy.visit('/global-chat');
  });

  it('should render the Global AI Chat UI', () => {
    cy.contains('Global AI Chat').should('be.visible');
    cy.findByLabelText('Message to AI', { exact: false }).should('exist');
    cy.findByRole('button', { name: /send/i }).should('exist');
  });

  it('should send a message and receive a response', () => {
    const testMessage = 'Hello AI!';
    cy.findByLabelText('Message to AI', { exact: false }).type(testMessage);
    cy.findByRole('button', { name: /send/i }).click();
    cy.contains(`You: ${testMessage}`).should('be.visible');
    // Wait for AI response (echo or OpenAI)
    cy.get('[role="log"]').contains(/AI:/i, { timeout: 10000 }).should('be.visible');
  });
});
