describe('Task Management', () => {
  let testUser: any;
  
  beforeEach(() => {
    // Create test users
    const userEmail = `creator${Date.now()}@example.com`;
    const assigneeEmail = `assignee${Date.now()}@example.com`;
    
    cy.request('POST', `${Cypress.env('API_URL')}/auth/register`, {
      name: 'Task Creator',
      email: userEmail,
      password: 'password123'
    }).then((response) => {
      testUser = response.body.data;
    });
    
    cy.request('POST', `${Cypress.env('API_URL')}/auth/register`, {
      name: 'Task Assignee',
      email: assigneeEmail,
      password: 'password123'
    });
    
    // Login as creator
    cy.login(userEmail, 'password123');
  });

  describe('Create Task', () => {
    it('should create a new task successfully', () => {
      cy.visit('/dashboard');
      
      // Open create task modal
      cy.contains('Create Task').click();
      
      // Fill task form
      cy.get('input[name="title"]').type('Test Task');
      cy.get('textarea[name="description"]').type('This is a test task description');
      
      // Set due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDateString = tomorrow.toISOString().slice(0, 16);
      cy.get('input[name="dueDate"]').type(dueDateString);
      
      cy.get('select[name="priority"]').select('High');
      
      // Select assignee (should be available in dropdown)
      cy.get('select[name="assignedToId"]').select(1); // Select first available user
      
      // Submit form
      cy.contains('button', 'Create Task').click();
      
      // Should close modal and show success
      cy.contains('Test Task').should('be.visible');
    });

    it('should show validation errors for empty fields', () => {
      cy.visit('/dashboard');
      cy.contains('Create Task').click();
      
      // Try to submit without filling required fields
      cy.contains('button', 'Create Task').click();
      
      cy.contains('Title is required').should('be.visible');
      cy.contains('Description is required').should('be.visible');
    });
  });

  describe('Task List', () => {
    beforeEach(() => {
      // Create a test task first
      cy.request({
        method: 'POST',
        url: `${Cypress.env('API_URL')}/tasks`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: {
          title: 'E2E Test Task',
          description: 'Task for E2E testing',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          priority: 'Medium',
          assignedToId: testUser.user._id
        }
      });
    });

    it('should display tasks in the dashboard', () => {
      cy.visit('/dashboard');
      cy.contains('E2E Test Task').should('be.visible');
    });

    it('should allow editing tasks', () => {
      cy.visit('/dashboard');
      
      // Click edit button on task
      cy.contains('E2E Test Task').parent().within(() => {
        cy.contains('Edit').click();
      });
      
      // Update task title
      cy.get('input[name="title"]').clear().type('Updated E2E Test Task');
      cy.contains('button', 'Update Task').click();
      
      // Should show updated task
      cy.contains('Updated E2E Test Task').should('be.visible');
    });

    it('should allow changing task status', () => {
      cy.visit('/dashboard');
      
      // Find task and move to In Progress
      cy.contains('E2E Test Task').parent().within(() => {
        cy.contains('Move to In Progress').click();
      });
      
      // Task status should update
      cy.contains('In Progress').should('be.visible');
    });

    it('should allow deleting tasks', () => {
      cy.visit('/dashboard');
      
      // Click delete button
      cy.contains('E2E Test Task').parent().within(() => {
        cy.contains('Delete').click();
      });
      
      // Confirm deletion in browser alert
      cy.on('window:confirm', () => true);
      
      // Task should be removed
      cy.contains('E2E Test Task').should('not.exist');
    });
  });

  describe('Task Filtering', () => {
    it('should filter tasks by status', () => {
      cy.visit('/dashboard');
      
      // Open filters
      cy.contains('Show Filters').click();
      
      // Select status filter
      cy.get('select[name="status"]').select('To Do');
      
      // Should filter tasks
      cy.url().should('include', 'status=To%20Do');
    });

    it('should filter tasks by priority', () => {
      cy.visit('/dashboard');
      
      cy.contains('Show Filters').click();
      cy.get('select[name="priority"]').select('High');
      
      cy.url().should('include', 'priority=High');
    });

    it('should use quick filters', () => {
      cy.visit('/dashboard');
      
      // Use overdue quick filter
      cy.contains('Overdue Tasks').click();
      
      cy.url().should('include', 'overdue=true');
    });
  });
});
