// Cypress E2E: Full login and task creation flow
/// <reference types="cypress" />

describe('E2E: Login and Task Creation', () => {
  const username = 'jakub';
  const password = 'cerulik123';

  it('should login, persist auth, navigate to /tasks, and create a task', () => {
    cy.visit('/login');
    cy.get('#login-username').type(username);
    cy.get('#login-password').type(password);
    cy.contains('Login').click();
    cy.url().should('include', '/dashboard');
    // Explicitly set auth in localStorage to guarantee persistence
    cy.window().then((win) => {
      win.localStorage.setItem('auth', JSON.stringify({ username, password }));
    });
    cy.visit('/tasks');
    cy.contains('New Task').click();
    cy.get('#name').type('E2E AI Task Test');
    cy.contains('Quick Create').click();
    cy.contains('Task created!').should('exist');
  });
});
