// cypress/e2e/task_detail_fields.cy.js
// E2E test to verify all fields from taskFieldConfig.ts are present and editable in TaskDetail
// To run: npx cypress open (after installing cypress)

describe('Task Detail Field Accessibility', () => {
  beforeEach(() => {
    // Adjust the URL to point to a task detail page in your app
    cy.visit('/task/1');
  });

  it('should render all editable fields from taskFieldConfig and allow editing', () => {
    // This assumes window.TASK_FIELD_CONFIG is exposed for test/dev
    cy.window().then(win => {
      const config = win.TASK_FIELD_CONFIG || {};
      Object.entries(config).forEach(([field, cfg]) => {
        if (!cfg.editable) return;
        const label = cfg.label;
        if (cfg.type === 'text' || cfg.type === 'number' || cfg.type === 'date') {
          cy.findByLabelText(label, { exact: false }).should('exist').type('test', { force: true });
        } else if (cfg.type === 'textarea') {
          cy.findByLabelText(label, { exact: false }).should('exist').type('test', { force: true });
        } else if (cfg.type === 'dropdown' || cfg.type === 'multi-select') {
          cy.findByLabelText(label, { exact: false }).should('exist').select(0, { force: true });
        } else if (cfg.type === 'boolean') {
          cy.findByLabelText(label, { exact: false }).should('exist').check({ force: true });
        }
      });
    });
  });
});
