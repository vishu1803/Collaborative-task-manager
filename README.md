
```markdown
# 🚀 Collaborative Task Manager

A modern, real-time collaborative task management application built with Next.js, Node.js, MongoDB, and Socket.io. This full-stack application enables teams to efficiently manage tasks with real-time notifications, comprehensive filtering, and intuitive user interface.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes and middleware
- Profile management

### 📋 Task Management
- **CRUD Operations**: Create, Read, Update, Delete tasks
- **Task Properties**: Title, description, due date, priority, status, assignee
- **Task Status**: To Do, In Progress, Review, Completed
- **Priority Levels**: Low, Medium, High, Urgent
- **Task Assignment**: Assign tasks to team members
- **Overdue Detection**: Automatic overdue task identification

### 🔄 Real-time Features
- **Live Updates**: Real-time task updates via Socket.io
- **Instant Notifications**: Toast notifications for task changes
- **User Presence**: Online/offline status tracking
- **Connection Status**: Real-time connection indicator
- **Notification Center**: Comprehensive notification management

### 📊 Dashboard & Analytics
- **Task Statistics**: Visual charts and metrics
- **Completion Rates**: Progress tracking
- **Priority Distribution**: Task priority analysis
- **Overdue Tasks**: Dedicated overdue task monitoring
- **Recent Activity**: Latest task updates

### 🔍 Advanced Filtering & Search
- **Status Filtering**: Filter by task status
- **Priority Filtering**: Filter by priority levels
- **User Filtering**: Filter by creator/assignee
- **Date Filtering**: Overdue task filtering
- **Sorting Options**: Multiple sorting criteria
- **Quick Filters**: One-click filter presets

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Modern UI**: Clean, intuitive interface
- **Accessibility**: WCAG 2.1 compliant
- **Progressive Enhancement**: Works without JavaScript

### 🔒 Security Features
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Output sanitization
- **CSRF Protection**: Token-based protection
- **Rate Limiting**: API request limiting
- **Secure Headers**: Security headers implementation

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + SWR
- **Form Handling**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **HTTP Client**: Fetch API
- **Build Tool**: Webpack (Next.js default)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Real-time**: Socket.io
- **Validation**: Joi/Zod
- **Security**: Helmet, CORS, bcryptjs
- **Testing**: Jest + Supertest

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Process Management**: PM2
- **Reverse Proxy**: Nginx
- **Database**: MongoDB Atlas (Production)
- **Deployment**: Docker containers
- **CI/CD**: GitHub Actions ready

### Development Tools
- **Testing**: Jest, Cypress, Artillery
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript
- **Documentation**: JSDoc
- **Version Control**: Git

## 🏗 Architecture

```

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │────│   Backend       │────│   Database      │
│   (Next.js)     │    │   (Express.js)  │    │   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                       │
│                       │
└───────────────────────┘
Socket.io
(Real-time sync)

```

### Key Design Patterns
- **MVC Architecture**: Model-View-Controller pattern
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business logic separation
- **Context API**: State management
- **Hook Pattern**: Reusable logic components

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **MongoDB** (v6.0 or higher) or MongoDB Atlas account
- **Git** (v2.0 or higher)
- **Docker** (v20.0 or higher) - for containerized deployment
- **Docker Compose** (v2.0 or higher) - for multi-container setup

### System Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space
- **OS**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)

## 🚀 Installation

### Option 1: Manual Setup

#### 1. Clone the Repository
```

git clone https://github.com/yourusername/collaborative-task-manager.git
cd collaborative-task-manager

```

#### 2. Backend Setup
```

cd backend

# Install dependencies

npm install

# Create environment file

cp .env.example .env

# Edit environment variables

nano .env  \# or use your preferred editor

# Build TypeScript

npm run build

```

#### 3. Frontend Setup
```

cd ../frontend

# Install dependencies

npm install

# Create environment file

cp .env.example .env.local

# Edit environment variables

nano .env.local  \# or use your preferred editor

```

#### 4. Database Setup
```


# Start MongoDB (if running locally)

mongod

# Or use MongoDB Atlas connection string in .env

```

### Option 2: Docker Setup

#### 1. Clone and Setup
```

git clone https://github.com/yourusername/collaborative-task-manager.git
cd collaborative-task-manager

```

#### 2. Environment Configuration
```


# Copy environment files

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit environment variables as needed

```

#### 3. Docker Deployment
```


# Build and start all services

docker-compose up -d

# Check service status

docker-compose ps

# View logs

docker-compose logs -f

```

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)

```


# Environment

NODE_ENV=development

# Server Configuration

PORT=5000
HOST=localhost

# Database

MONGODB_URI=mongodb://localhost:27017/task-manager

# For MongoDB Atlas:

```
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/task-manager?retryWrites=true&w=majority
```


# JWT Configuration

JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters-long
JWT_EXPIRES_IN=24h

# CORS Configuration

FRONTEND_URL=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Security

BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

```

### Frontend Environment Variables (`frontend/.env.local`)

```


# API Configuration

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Feature Flags

NEXT_PUBLIC_ENABLE_PWA=false
NEXT_PUBLIC_ENABLE_ANALYTICS=false

```

### Production Configuration

For production deployment, update environment variables:

```


# Backend (.env.production)

NODE_ENV=production
MONGODB_URI=mongodb+srv://production-cluster-connection
JWT_SECRET=production-jwt-secret-key
FRONTEND_URL=https://yourdomain.com
BCRYPT_SALT_ROUNDS=12

# Frontend (.env.production)

NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com

```

## 🔧 Development

### Starting Development Servers

#### Terminal 1 - Backend
```

cd backend
npm run dev

# Server runs on http://localhost:5000

```

#### Terminal 2 - Frontend
```

cd frontend
npm run dev

# Client runs on http://localhost:3000

```

#### Terminal 3 - Database (if local)
```

mongod

# MongoDB runs on mongodb://localhost:27017

```

### Development Scripts

#### Backend Scripts
```

npm run dev          \# Start development server with nodemon
npm run build        \# Build TypeScript to JavaScript
npm run start        \# Start production server
npm test             \# Run unit tests
npm run test:watch   \# Run tests in watch mode
npm run test:coverage \# Run tests with coverage
npm run lint         \# Run ESLint
npm run format       \# Format code with Prettier

```

#### Frontend Scripts
```

npm run dev          \# Start Next.js development server
npm run build        \# Build for production
npm run start        \# Start production server
npm run lint         \# Run ESLint
npm run type-check   \# Run TypeScript checks
npm run test:e2e     \# Run Cypress E2E tests

```

### Code Quality Tools

#### ESLint Configuration
Both frontend and backend use ESLint with TypeScript support:
```

npm run lint         \# Check for issues
npm run lint:fix     \# Fix auto-fixable issues

```

#### Prettier Configuration
Consistent code formatting:
```

npm run format       \# Format all files

```

#### TypeScript Strict Mode
Both projects use strict TypeScript configuration for type safety.

## 🧪 Testing

### Backend Testing

#### Unit Tests
```

cd backend

# Run all tests

npm test

# Run tests in watch mode

npm run test:watch

# Run with coverage

npm run test:coverage

# Run specific test file

npm test -- authService.test.ts

```

#### Test Coverage
- **Services**: 95%+ coverage
- **Controllers**: 90%+ coverage
- **Models**: 100% coverage
- **Utilities**: 95%+ coverage

### Frontend Testing

#### E2E Tests with Cypress
```

cd frontend

# Run Cypress tests headless

npm run test:e2e

# Open Cypress interactive mode

npm run test:e2e:open

# Run specific test

npx cypress run --spec "cypress/e2e/auth.cy.ts"

```

#### Integration Tests
```


# Run full integration test suite

npm run test:integration

# Run comprehensive test suite

../scripts/run-all-tests.sh

```

### Load Testing

#### Artillery Load Tests
```

cd backend

# Install Artillery globally

npm install -g artillery

# Run load tests

npm run test:load

# Custom load test

artillery run load-test.yml

```

### Test Reports

Tests generate comprehensive reports:
- **Unit Tests**: HTML coverage reports in `backend/coverage/`
- **E2E Tests**: Videos and screenshots in `frontend/cypress/`
- **Load Tests**: Performance metrics in terminal

## 🚀 Deployment

### Pre-deployment Checklist

#### 1. Environment Setup ✅
- [ ] Production environment variables configured
- [ ] MongoDB Atlas cluster setup and accessible
- [ ] SSL certificates obtained (for HTTPS)
- [ ] Domain DNS configured
- [ ] Firewall rules configured

#### 2. Security Checklist ✅
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database connection uses SSL
- [ ] Environment variables are secure
- [ ] CORS origins properly configured
- [ ] Rate limiting configured
- [ ] Security headers enabled

#### 3. Performance Checklist ✅
- [ ] Database indexes created
- [ ] Frontend assets optimized
- [ ] Gzip compression enabled
- [ ] CDN configured (if applicable)
- [ ] Caching strategies implemented

#### 4. Monitoring Setup ✅
- [ ] Health check endpoints working
- [ ] Logging configured
- [ ] Error tracking setup
- [ ] Performance monitoring ready
- [ ] Backup strategies in place

### Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Production Docker Deployment
```


# 1. Clone repository

git clone https://github.com/yourusername/collaborative-task-manager.git
cd collaborative-task-manager

# 2. Configure environment

cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production

# Edit production environment variables

nano backend/.env.production
nano frontend/.env.production

# 3. Build and deploy

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 4. Check deployment

docker-compose ps
docker-compose logs -f

# 5. Run health checks

curl http://localhost:5000/health
curl http://localhost:3000

```

#### Nginx Setup (Optional)
```


# Install Nginx

sudo apt update
sudo apt install nginx

# Copy configuration

sudo cp nginx.conf /etc/nginx/sites-available/task-manager
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/

# Test and reload

sudo nginx -t
sudo systemctl reload nginx

```

### Option 2: PM2 Deployment

#### Backend with PM2
```

cd backend

# Install PM2 globally

npm install -g pm2

# Build application

npm run build

# Start with PM2

pm2 start ecosystem.config.js --env production

# Monitor

pm2 status
pm2 logs
pm2 monit

```

#### Frontend with PM2
```

cd frontend

# Build application

npm run build

# Start with PM2

pm2 start npm --name "task-manager-frontend" -- start

# Save PM2 configuration

pm2 save
pm2 startup

```

### Option 3: Cloud Deployment

#### Heroku Deployment
```


# Install Heroku CLI

# Create Heroku apps

heroku create task-manager-api
heroku create task-manager-client

# Set environment variables

heroku config:set NODE_ENV=production --app task-manager-api
heroku config:set MONGODB_URI=your-atlas-connection --app task-manager-api
heroku config:set JWT_SECRET=your-jwt-secret --app task-manager-api

# Deploy backend

git subtree push --prefix backend heroku-api main

# Deploy frontend

git subtree push --prefix frontend heroku-client main

```

#### AWS/Azure/GCP Deployment
Detailed cloud deployment guides available in `docs/deployment/`

### Post-Deployment Verification

#### 1. Health Checks
```


# Backend health

curl https://your-api-domain.com/health

# Should return: {"status": "ok", "timestamp": "..."}

# Frontend accessibility

curl https://your-frontend-domain.com

# Should return: 200 OK

# Database connectivity test

curl https://your-api-domain.com/api/auth/test-db

```

#### 2. Functionality Tests
```


# Run automated deployment tests

./scripts/deployment-test.sh

# Manual verification checklist:

# [ ] User registration works

# [ ] User login works

# [ ] Task creation works

# [ ] Real-time notifications work

# [ ] Socket.io connection established

# [ ] All pages load correctly

```

#### 3. Performance Validation
```


# Load test production environment

artillery run load-test-prod.yml

# Monitor response times

curl -w "@curl-format.txt" -o /dev/null -s https://your-api-domain.com/api/tasks

```

#### 4. Security Validation
```


# SSL certificate check

openssl s_client -connect your-domain.com:443

# Security headers check

curl -I https://your-domain.com

# Check for common vulnerabilities

npm audit

```

### Deployment Monitoring

#### Application Monitoring
- **Health Checks**: Automated endpoint monitoring
- **Error Tracking**: Real-time error reporting
- **Performance Metrics**: Response time monitoring
- **Uptime Monitoring**: 24/7 availability tracking

#### Database Monitoring
- **Connection Pool**: Monitor active connections
- **Query Performance**: Slow query identification
- **Storage Usage**: Disk space monitoring
- **Backup Status**: Regular backup verification

### Rollback Strategy

#### Quick Rollback Process
```


# Using Docker

docker-compose down
git checkout previous-stable-tag
docker-compose up -d

# Using PM2

pm2 stop all
git checkout previous-stable-tag
npm run build
pm2 restart all

```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```

POST /api/auth/register
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"password": "securePassword123"
}

```

#### Login User
```

POST /api/auth/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "securePassword123"
}

```

#### Get Profile
```

GET /api/auth/profile
Authorization: Bearer <jwt_token>

```

### Task Endpoints

#### Get All Tasks
```

GET /api/tasks?page=1\&limit=10\&status=To%20Do\&priority=High
Authorization: Bearer <jwt_token>

```

#### Create Task
```

POST /api/tasks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
"title": "Complete Project",
"description": "Finish the collaborative task manager",
"dueDate": "2025-12-31T23:59:59.000Z",
"priority": "High",
"assignedToId": "user_id_here"
}

```

#### Update Task
```

PUT /api/tasks/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
"title": "Updated Title",
"status": "In Progress"
}

```

#### Delete Task
```

DELETE /api/tasks/:id
Authorization: Bearer <jwt_token>

```

### Response Format

All API responses follow this format:
```

{
"success": true,
"message": "Operation completed successfully",
"data": {
// Response data here
}
}

```

Error responses:
```

{
"success": false,
"message": "Error description",
"error": "Detailed error information"
}

```

## 📁 Project Structure



collaborative-task-manager/
├── README.md
├── docker-compose.yml
├── nginx.conf
├── scripts/
│   ├── deploy.sh
│   ├── run-all-tests.sh
│   └── seed-test-data.js
├── backend/
│   ├── src/
│   │   ├── controllers/         \# Request handlers
│   │   ├── models/             \# Database models
│   │   ├── services/           \# Business logic
│   │   ├── middleware/         \# Express middleware
│   │   ├── routes/             \# API routes
│   │   ├── sockets/            \# Socket.io handlers
│   │   ├── utils/              \# Utility functions
│   │   ├── types/              \# TypeScript types
│   │   ├── config/             \# Configuration files
│   │   └── __tests__/          \# Test files
│   ├── dist/                   \# Compiled JavaScript
│   ├── coverage/               \# Test coverage reports
│   ├── logs/                   \# Application logs
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                \# Next.js app directory
│   │   ├── components/         \# React components
│   │   ├── contexts/           \# React contexts
│   │   ├── hooks/              \# Custom hooks
│   │   ├── lib/                \# Utility libraries
│   │   ├── types/              \# TypeScript types
│   │   └── utils/              \# Utility functions
│   ├── public/                 \# Static assets
│   ├── cypress/                \# E2E tests
│   ├── .next/                  \# Next.js build output
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── cypress.config.ts
│   └── Dockerfile
└── docs/                       \# Documentation
├── api/                    \# API documentation
├── deployment/             \# Deployment guides
└── development/            \# Development guides

```

```

## 🤝 Contributing

We welcome contributions to the Collaborative Task Manager! Please follow these guidelines:

### Development Workflow

1. **Fork the Repository**
```

git fork https://github.com/yourusername/collaborative-task-manager.git

```

2. **Create Feature Branch**
```

git checkout -b feature/your-feature-name

```

3. **Make Changes**
- Follow TypeScript and ESLint guidelines
- Write tests for new functionality
- Update documentation as needed

4. **Run Tests**
```


# Backend tests

cd backend \&\& npm test

# Frontend tests

cd frontend \&\& npm run test:e2e

# Full test suite

./scripts/run-all-tests.sh

```

5. **Submit Pull Request**
- Provide clear description
- Reference related issues
- Ensure all tests pass

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow project configuration
- **Prettier**: Use for code formatting
- **Testing**: Maintain 90%+ coverage
- **Documentation**: Update README for new features

### Bug Reports

Please use GitHub issues with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable


## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **MongoDB Team** - For the flexible database solution
- **Socket.io Team** - For real-time communication capabilities
- **TypeScript Team** - For type safety and developer experience
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

For support and questions:

- **Documentation**: Check the `docs/` directory
- **Issues**: Create a GitHub issue
- **Email**: support@taskmanager.com
- **Discord**: Join our community server

---

**Built with ❤️ by [Vishwanath Nishad]**

*Last updated: October 29, 2025*
```


