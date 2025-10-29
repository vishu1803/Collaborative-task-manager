describe('Full Application Integration', () => {
  it('should complete full user journey', () => {
    const userEmail = `integration${Date.now()}@example.com`;
    const assigneeEmail = `assignee${Date.now()}@example.com`;
    
    // Step 1: Register main user
    cy.visit('/auth/register');
    cy.get('input[name="name"]').type('Integration User');
    cy.get('input[name="email"]').type(userEmail);
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="confirmPassword"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should be on dashboard
    cy.url().should('include', '/dashboard');
    
    // Step 2: Create assignee user via API
    cy.request('POST', `${Cypress.env('API_URL')}/auth/register`, {
      name: 'Assignee User',
      email: assigneeEmail,
      password: 'password123'
    });
    
    // Step 3: Create a task
    cy.contains('Create Task').click();
    cy.get('input[name="title"]').type('Integration Test Task');
    cy.get('textarea[name="description"]').type('Full integration test task');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDateString = tomorrow.toISOString().slice(0, 16);
    cy.get('input[name="dueDate"]').type(dueDateString);
    
    cy.get('select[name="priority"]').select('High');
    cy.get('select[name="assignedToId"]').select(1);
    cy.contains('button', 'Create Task').click();
    
    // Step 4: Verify task appears in dashboard
    cy.contains('Integration Test Task').should('be.visible');
    
    // Step 5: Edit the task
    cy.contains('Integration Test Task').parent().within(() => {
      cy.contains('Edit').click();
    });
    
    cy.get('input[name="title"]').clear().type('Updated Integration Test Task');
    cy.contains('button', 'Update Task').click();
    cy.contains('Updated Integration Test Task').should('be.visible');
    
    // Step 6: Change task status
    cy.contains('Updated Integration Test Task').parent().within(() => {
      cy.contains('Move to In Progress').click();
    });
    
    // Step 7: Go to My Tasks page
    cy.contains('My Tasks').click();
    cy.url().should('include', '/my-tasks');
    cy.contains('Updated Integration Test Task').should('be.visible');
    
    // Step 8: Go to All Tasks page
    cy.contains('All Tasks').click();
    cy.url().should('include', '/tasks');
    cy.contains('Updated Integration Test Task').should('be.visible');
    
    // Step 9: Visit Profile page
    cy.contains('Profile').click();
    cy.url().should('include', '/profile');
    cy.contains('Integration User').should('be.visible');
    
    // Step 10: Update profile
    cy.get('input[name="name"]').clear().type('Updated Integration User');
    cy.contains('Save Changes').click();
    cy.contains('Profile updated successfully').should('be.visible');
    
    // Step 11: Return to dashboard and verify everything works
    cy.contains('Dashboard').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome, Updated Integration User').should('be.visible');
    cy.contains('Updated Integration Test Task').should('be.visible');
    
    // Step 12: Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/auth/login');
  });
});
