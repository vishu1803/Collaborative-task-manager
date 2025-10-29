describe('Real-time Features', () => {
  let user1Email: string;
  let user2Email: string;

  beforeEach(() => {
    user1Email = `user1${Date.now()}@example.com`;
    user2Email = `user2${Date.now()}@example.com`;
    
    // Create two test users
    cy.request('POST', `${Cypress.env('API_URL')}/auth/register`, {
      name: 'User One',
      email: user1Email,
      password: 'password123'
    });
    
    cy.request('POST', `${Cypress.env('API_URL')}/auth/register`, {
      name: 'User Two',
      email: user2Email,
      password: 'password123'
    });
  });

  it('should show connection status', () => {
    cy.login(user1Email, 'password123');
    cy.visit('/dashboard');
    
    // Should show connected status
    cy.contains('Connected', { timeout: 10000 }).should('be.visible');
  });

  it('should display notification dropdown', () => {
    cy.login(user1Email, 'password123');
    cy.visit('/dashboard');
    
    // Should have notification bell icon
    cy.get('button').contains('🔔').should('be.visible');
  });

  it('should show online users count', () => {
    cy.login(user1Email, 'password123');
    cy.visit('/dashboard');
    
    // Should show online users count
    cy.contains(/\d+ online/).should('be.visible');
  });
});
