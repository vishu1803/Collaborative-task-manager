describe('Authentication Flow', () => {
  beforeEach(() => {
    // Always clear state before each test
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  // 🧩 USER REGISTRATION
  describe('User Registration', () => {
    it('should allow user to register with valid credentials', () => {
      const userData = {
        name: 'John Doe',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      };

      cy.visit('/auth/register');
      cy.contains('Create your account').should('be.visible');

      cy.get('input[name="name"]').type(userData.name);
      cy.get('input[name="email"]').type(userData.email);
      cy.get('input[name="password"]').type(userData.password);
      cy.get('input[name="confirmPassword"]').type(userData.password);

      cy.get('button[type="submit"]').click();

      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.contains(`Welcome, ${userData.name}`).should('be.visible');
    });

    it('should show validation errors for invalid input', () => {
      cy.visit('/auth/register');
      cy.get('button[type="submit"]').click();

      cy.contains('Name is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should show error for mismatched passwords', () => {
      cy.visit('/auth/register');

      cy.get('input[name="name"]').type('John Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="confirmPassword"]').type('different');

      cy.get('button[type="submit"]').click();
      cy.contains("Passwords don't match").should('be.visible');
    });
  });

  // 🧩 USER LOGIN
  describe('User Login', () => {
    const randomEmail = `testuser_${Date.now()}@example.com`;

    before(() => {
      // Create user once before login tests
      cy.request('POST', `${Cypress.env('API_URL')}/auth/register`, {
        name: 'Test User',
        email: randomEmail,
        password: 'password123'
      });
    });

    it('should allow user to login with valid credentials', () => {
      cy.visit('/auth/login');
      cy.contains('Sign in to your account').should('be.visible');

      cy.get('input[type="email"]').type(randomEmail);
      cy.get('input[type="password"]').type('password123');
      cy.get('button[type="submit"]').click();

      cy.url().should('include', '/dashboard');
      cy.contains('Welcome, Test User').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/auth/login');
      cy.get('input[type="email"]').type('wrong@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();

      cy.contains('Invalid email or password').should('be.visible');
    });

    it('should redirect unauthenticated users to login', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/auth/login');
    });
  });

  // 🧩 LOGOUT FLOW
  describe('Logout', () => {
    it('should logout user and redirect to login', () => {
      const email = `logout_${Date.now()}@example.com`;
      const password = 'password123';

      // 1️⃣ Create user directly
      cy.request('POST', `${Cypress.env('API_URL')}/auth/register`, {
        name: 'Logout Test',
        email,
        password
      }).then(() => {
        // 2️⃣ Login through UI
        cy.visit('/auth/login');
        cy.get('input[type="email"]').type(email);
        cy.get('input[type="password"]').type(password);
        cy.get('button[type="submit"]').click();

        // 3️⃣ Verify dashboard loaded
        cy.url().should('include', '/dashboard');
        cy.contains(/logout|sign out/i).should('be.visible');

        // 4️⃣ Perform logout
        cy.contains(/logout|sign out/i).click();

        // 5️⃣ Verify redirect to login
        cy.url().should('include', '/auth/login');
        cy.window().its('localStorage.auth_token').should('not.exist');
      });
    });
  });
});
