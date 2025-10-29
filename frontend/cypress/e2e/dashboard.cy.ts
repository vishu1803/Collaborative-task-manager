describe('Dashboard', () => {
  beforeEach(() => {
    // Create test user and login
    const userEmail = `testuser${Date.now()}@example.com`;
    cy.register('Test User', userEmail, 'password123');
  });

  it('should display dashboard with stats cards', () => {
    cy.visit('/dashboard');
    
    // Check if dashboard elements are present
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Total Tasks').should('be.visible');
    cy.contains('Completed').should('be.visible');
    cy.contains('In Progress').should('be.visible');
    cy.contains('Overdue').should('be.visible');
  });

  it('should show create task button', () => {
    cy.visit('/dashboard');
    cy.contains('Create Task').should('be.visible');
  });

  it('should display filters section', () => {
    cy.visit('/dashboard');
    cy.contains('Filters & Sorting').should('be.visible');
  });

  it('should show connection status', () => {
    cy.visit('/dashboard');
    // Socket connection might take time, so we wait
    cy.contains('Connected', { timeout: 10000 }).should('be.visible');
  });

  it('should display recent tasks section', () => {
    cy.visit('/dashboard');
    cy.contains('Recent Tasks').should('be.visible');
  });

  it('should display overdue tasks section', () => {
    cy.visit('/dashboard');
    cy.contains('Overdue Tasks').should('be.visible');
  });
});
