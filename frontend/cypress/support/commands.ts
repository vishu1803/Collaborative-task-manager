/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      register(name: string, email: string, password: string): Chainable<void>;
      createTask(taskData: {
        title: string;
        description: string;
        dueDate: string;
        priority: string;
        assignedTo: string;
      }): Chainable<void>;
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// ✅ Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();

  // Wait for redirect
  cy.url({ timeout: 15000 }).should('include', '/dashboard');
  cy.window().its('localStorage.auth_token').should('exist');
});

// ✅ Custom command for registration
Cypress.Commands.add('register', (name: string, email: string, password: string) => {
  cy.visit('/auth/register');
  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="confirmPassword"]').type(password);
  cy.get('button[type="submit"]').click();

  // Accept either dashboard or login (depending on flow)
  cy.url({ timeout: 15000 }).should('match', /\/(dashboard|auth\/login)$/);
});

// ✅ Custom command for creating tasks
Cypress.Commands.add('createTask', (taskData) => {
  cy.visit('/dashboard');
  cy.contains('Create Task').click();

  cy.get('input[name="title"]').type(taskData.title);
  cy.get('textarea[name="description"]').type(taskData.description);
  cy.get('input[name="dueDate"]').type(taskData.dueDate);
  cy.get('select[name="priority"]').select(taskData.priority);
  cy.get('select[name="assignedToId"]').select(taskData.assignedTo);

  cy.contains('Create Task').click();
  cy.contains('Task created successfully', { timeout: 10000 }).should('be.visible');
});

// ✅ Custom command for test IDs
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

export {};
