/// <reference types="cypress" />

declare namespace Cypress {
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
