// cypress/e2e/profile_menu.cy.js
// E2E test for the Profile Menu in the top-right nav

// Ensure Testing Library commands are available
import '@testing-library/cypress/add-commands';

describe('Profile Menu', () => {
  beforeEach(() => {
    // Register the user before login (ignore error if already exists)
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/register',
      body: {
        username: 'jakub',
        password: 'cerulik123',
        email: 'jakub@example.com'
      },
      failOnStatusCode: false
    }).then(() => {
      // Programmatically log in via backend and set token in localStorage
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/login',
        form: true,
        body: {
          username: 'jakub',
          password: 'cerulik123'
        }
      }).then((response) => {
        const token = response.body.access_token;
        window.localStorage.setItem('token', token);
        // Set localStorage as expected by the frontend
        cy.window().then((win) => {
          win.localStorage.setItem('auth', JSON.stringify({
            username: 'jakub',
            password: 'cerulik123',
            email: 'jakub@example.com'
          }));
        });
      });
      cy.visit('/dashboard');
      cy.url().then(url => {
        cy.log('Current URL after visiting /dashboard: ' + url);
      });
    });
  });

  it('should open the profile menu and show user info', () => {
    cy.wait(1000); // Give time for menu to render
    cy.window().then(win => {
      cy.log('localStorage after login: ' + JSON.stringify(win.localStorage));
    });
    cy.reload(); // Force reload to sync localStorage-based auth
    cy.url().should('include', '/dashboard');
    cy.wait(500);
    cy.window().then(win => {
      cy.log('localStorage after reload: ' + JSON.stringify(win.localStorage));
    });
    cy.findByLabelText('Open profile menu').click();
    cy.get('[role="menu"]').should('exist');
    cy.get('[role="menu"]').should('contain', 'jakub');
    cy.findByRole('menuitem', { name: /log out/i }).should('exist');
    cy.findByRole('menuitem', { name: /delete account/i }).should('exist');
  });

  it('should show the delete confirmation dialog', () => {
    cy.findByLabelText('Open profile menu').click();
    cy.findByRole('menuitem', { name: /delete account/i }).click();
    cy.contains('Delete Account').should('be.visible');
    cy.contains('Are you sure? This action cannot be undone.').should('be.visible');
    cy.findByRole('button', { name: /cancel/i }).should('exist');
    cy.findByRole('button', { name: /delete/i }).should('exist');
  });
});
