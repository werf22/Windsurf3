// Cypress E2E test for /api/ai-edit and AI chat-driven editing
// Covers: AI chat can edit a task field, strict validation, error handling

describe('AI Edit Endpoint & Chat Integration', () => {
  const testTask = {
    name: 'Cypress AI Edit Task',
    description: 'Task for AI edit E2E test',
  };
  let taskId;

  before(() => {
    // Create a task via API
    cy.request({
      method: 'POST',
      url: '/api/tasks',
      body: testTask,
      auth: { username: 'jakub', password: 'cerulik123' },
      failOnStatusCode: false,
    }).then((resp) => {
      cy.log('Response:', JSON.stringify(resp));
      expect(resp.status).to.eq(200);
      taskId = resp.body.id;
    });
  });

  after(() => {
    // Clean up: delete the created task
    if (taskId) {
      cy.request({
        method: 'DELETE',
        url: `/api/tasks/${taskId}`,
        auth: { username: 'jakub', password: 'cerulik123' },
        failOnStatusCode: false,
      });
    }
  });

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.setItem('auth', JSON.stringify({ username: 'jakub', password: 'cerulik123' }));
    });
    cy.visit('/global-chat');
  });

  it('AI chat can edit a dropdown field', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set priority_id of task ${taskId} to P0 - NOW`);
    cy.get('button[type="submit"]').click();
    cy.contains(`Updated priority_id of Task ${taskId} to P0 - NOW`).should('exist');
  });

  it('AI chat rejects invalid field name', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set not_a_field of task ${taskId} to whatever`);
    cy.get('button[type="submit"]').click();
    cy.contains('No valid field to edit was found').should('exist');
  });

  it('AI chat rejects invalid value for dropdown', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set priority_id of task ${taskId} to INVALID_OPTION`);
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid value for priority_id').should('exist');
  });

  it('AI chat rejects missing task id', () => {
    cy.get('input[aria-label="Message to AI"]').type('Set priority_id to 1');
    cy.get('button[type="submit"]').click();
    cy.contains('No task_id provided or found').should('exist');
  });

  it('AI chat can edit a text field (description)', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set description of task ${taskId} to Updated by AI`);
    cy.get('button[type="submit"]').click();
    cy.contains(`Updated description of Task ${taskId} to Updated by AI`).should('exist');
  });

  it('AI chat can edit a multi-select field (tags)', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set tags of task ${taskId} to #Typ:Kreatíva,#Typ:Admin`);
    cy.get('button[type="submit"]').click();
    cy.contains(`Updated tags of Task ${taskId} to #Typ:Kreatíva,#Typ:Admin`).should('exist');
  });

  it('AI chat can edit a date field (due_date)', () => {
    const date = '2025-12-31';
    cy.get('input[aria-label="Message to AI"]').type(`Set due_date of task ${taskId} to ${date}`);
    cy.get('button[type="submit"]').click();
    cy.contains(`Updated due_date of Task ${taskId} to ${date}`).should('exist');
  });

  it('AI chat can edit a textarea field (notes)', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set notes of task ${taskId} to This is a long note from AI.`);
    cy.get('button[type="submit"]').click();
    cy.contains(`Updated notes of Task ${taskId} to This is a long note from AI.`).should('exist');
  });

  it('AI chat rejects invalid value for multi-select', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set tags of task ${taskId} to INVALID_TAG`);
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid value(s) for tags').should('exist');
  });

  it('AI chat rejects invalid value for date', () => {
    cy.get('input[aria-label="Message to AI"]').type(`Set due_date of task ${taskId} to notadate`);
    cy.get('button[type="submit"]').click();
    cy.contains('Invalid value for due_date').should('exist');
  });
});
