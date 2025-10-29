// ✅ Import all custom commands (register, login, createTask, etc.)
import './commands';

// ✅ Hide fetch/XHR requests from Cypress command log (optional)
Cypress.on('window:before:load', (win) => {
  const originalFetch = win.fetch;
  win.fetch = (...args) => originalFetch.apply(win, args);
});

// ✅ Use cy.session() to persist authentication between tests
// (replaces old Cypress.Cookies.defaults)
beforeEach(() => {
  // If a token exists, restore the session
  cy.window().then((win) => {
    const token = win.localStorage.getItem('auth_token');
    if (token) {
      cy.session(['auth_token'], () => {
        win.localStorage.setItem('auth_token', token);
      });
    }
  });
});

// ✅ (Optional best practice) Clear sessionStorage between tests
afterEach(() => {
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});
