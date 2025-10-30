
```markdown
# 🚀 Collaborative Task Manager

A full-stack web application for collaborative task management with real-time updates, built with modern technologies and deployed to production.

## 🌐 **Live Application**

- **Frontend**: [https://collaborative-task-manager-fc26.vercel.app](https://collaborative-task-manager-fc26.vercel.app)
- **Backend API**: [https://collaborative-task-manager-3jhp.onrender.com](https://collaborative-task-manager-3jhp.onrender.com)

## 🛠️ **Tech Stack**

### **Frontend**
- **Next.js 16** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for responsive styling
- **React Hook Form** for form management and validation
- **Zod** for schema validation
- **Socket.io Client** for real-time updates

### **Backend**
- **Node.js** with Express.js
- **TypeScript** for backend type safety
- **Prisma ORM** for database operations
- **Socket.io** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Zod** for DTO validation

### **Database**
- **PostgreSQL** (Production: Render PostgreSQL)
- **Prisma** as ORM with migration support

### **Deployment**
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Render PostgreSQL

## 🗄️ **Database Architecture Decision**

### **PostgreSQL vs MongoDB: Why We Chose PostgreSQL**

We migrated from MongoDB to PostgreSQL during development for several critical reasons:

#### **1. ACID Compliance & Data Integrity**
- **PostgreSQL**: Full ACID transactions ensure data consistency across task assignments
- **Critical Need**: When multiple users simultaneously assign/update tasks, PostgreSQL prevents race conditions and data corruption
- **MongoDB Limitation**: Eventual consistency model could lead to conflicting task states

#### **2. Complex Relational Queries**
- **Task Management Requirements**: Our app needs complex joins between users, tasks, and assignments
- **PostgreSQL Advantage**: Native support for foreign keys, cascading deletes, and optimized JOIN operations
- **Performance**: Significantly faster for dashboard analytics and user-specific task filtering

#### **3. TypeScript Integration Excellence**
- **Prisma + PostgreSQL**: Auto-generated TypeScript types with compile-time safety
- **Developer Experience**: IntelliSense support, zero runtime type errors
- **Schema Evolution**: Type-safe database migrations and schema changes

#### **4. Real-Time Constraints**
- **Consistent Reads**: PostgreSQL ensures all users see the same task state immediately after updates
- **Socket.io Integration**: Reliable triggers for real-time notifications without data inconsistencies

#### **5. Production Scalability**
- **Connection Pooling**: Superior connection management for concurrent users
- **Query Optimization**: Advanced indexing and query planning for large task datasets
- **Cloud Support**: Better support on modern platforms (Render, Vercel, Railway)

## 📊 **Database Schema**

```

-- Users table
model User {
id        String   @id @default(cuid())
email     String   @unique
name      String
password  String
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @updatedAt @map("updated_at")

createdTasks  Task[] @relation("TaskCreator")
assignedTasks Task[] @relation("TaskAssignee")
@@map("users")
}

-- Tasks table
model Task {
id          String    @id @default(cuid())
title       String    @db.VarChar(100)
description String?
status      Status    @default(TODO)
priority    Priority  @default(MEDIUM)
dueDate     DateTime? @map("due_date")
createdAt   DateTime  @default(now()) @map("created_at")
updatedAt   DateTime  @updatedAt @map("updated_at")

creatorId    String @map("creator_id")
assignedToId String? @map("assigned_to_id")

creator    User  @relation("TaskCreator", fields: [creatorId], references: [id], onDelete: Cascade)
assignedTo User? @relation("TaskAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
@@map("tasks")
}

-- Enums
enum Status {
TODO
IN_PROGRESS
REVIEW
COMPLETED
}

enum Priority {
LOW
MEDIUM
HIGH
URGENT
}

```

## 🏗️ **Architecture Overview**

### **Backend Architecture Pattern**

We implemented a **Service-Repository pattern** with clear separation of concerns:

```

Controllers/ ← HTTP request handling \& validation
├── Services/ ← Business logic \& data transformation
├── Repositories/ ← Data access layer (Prisma)
├── DTOs/ ← Data Transfer Objects (Zod validation)
├── Middleware/ ← Authentication, CORS, logging
└── Utils/ ← Helper functions \& utilities

```

#### **DTO Validation Strategy**
- **Zod Schemas**: Type-safe input validation for all endpoints
- **CreateTaskDto**: Validates task creation with title length limits (100 chars)
- **UpdateTaskDto**: Partial validation for task updates
- **UserRegistrationDto**: Email validation and password strength requirements

#### **JWT Implementation**
- **HttpOnly Cookies**: Secure token storage (not localStorage)
- **Refresh Token Rotation**: Enhanced security with token refresh
- **Middleware Protection**: Route-level authentication guards

### **Frontend Architecture**

- **App Router**: Next.js 13+ file-based routing
- **Component Structure**: Modular, reusable React components
- **State Management**: Server state via React Query, client state via useState/useContext
- **Real-time Integration**: Socket.io client with connection status management

## 📊 **Data Management & State**

### **Server State Management**
- **React Query**: Caching, background updates, and optimistic updates
- **Cache Invalidation**: Automatic refetch on task mutations
- **Optimistic Updates**: Immediate UI updates before server confirmation
- **Background Sync**: Tasks stay synchronized across browser tabs

### **Form Management**
- **React Hook Form**: Performance-optimized form handling
- **Zod Integration**: Runtime schema validation with TypeScript inference
- **Real-time Validation**: Instant feedback on form inputs
- **Error Handling**: User-friendly error messages with field-level validation

### **Loading States**
- **Skeleton Components**: Smooth loading transitions
- **Suspense Boundaries**: Granular loading states for different UI sections
- **Error Boundaries**: Graceful error handling and recovery

## 🔄 **Socket.io Real-Time Implementation**

### **Real-Time Features**
- **Live Task Updates**: Instant synchronization when tasks are created, updated, or deleted
- **Assignment Notifications**: Real-time in-app notifications when tasks are assigned
- **Status Changes**: All connected users see task status updates immediately
- **Connection Management**: Automatic reconnection and connection status indicators

### **Socket.io Architecture**
```
## 🏗 Architecture

```

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │────│   Backend       │────│   Database      │
│   (Next.js)     │    │   (Express.js)  │    │   (PostgreSQL)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                       │
│                       │
└───────────────────────┘
Socket.io
(Real-time sync)

```

// Server-side event handling
socket.on('join_user_room', (userId) => {
socket.join(`user_${userId}`)
})

socket.on('task_updated', (taskData) => {
// Broadcast to all users except sender
socket.broadcast.emit('task_change', taskData)

// Send notification to assigned user
if (taskData.assignedToId) {
socket.to(`user_${taskData.assignedToId}`).emit('task_assigned', taskData)
}
})

```

### **Client-side Integration**
- **Connection Status**: Visual indicators for Socket.io connection state
- **Event Handling**: Listeners for task updates, assignments, and notifications
- **Reconnection Logic**: Automatic reconnection with exponential backoff

## 🚀 **Features**

### **Core Functionality**
- ✅ **User Authentication** (Registration, Login, JWT with HttpOnly cookies)
- ✅ **Task CRUD Operations** (Create, Read, Update, Delete)
- ✅ **Real-time Collaboration** (Socket.io live updates)
- ✅ **Task Assignment** (Assign tasks to team members)
- ✅ **Priority Management** (Low, Medium, High, Urgent)
- ✅ **Status Tracking** (TODO, In Progress, Review, Completed)
- ✅ **Due Date Management** with overdue detection
- ✅ **User Dashboard** with personalized views
- ✅ **Filtering & Sorting** (Status, Priority, Due Date)

### **Advanced Features**
- ✅ **Responsive Design** (Mobile-first approach with Tailwind CSS)
- ✅ **Loading States** (Skeleton components and smooth transitions)
- ✅ **Error Handling** (Comprehensive error boundaries and user feedback)
- ✅ **Type Safety** (Full TypeScript implementation across stack)
- ✅ **Input Validation** (Zod schemas with real-time validation)
- ✅ **Security** (Password hashing, JWT tokens, CORS protection)

## 🛠️ **Local Development Setup**

### **Prerequisites**
```

- Node.js 18+
- PostgreSQL database
- Git
- npm or yarn

```

### **Backend Setup**
```


# Clone repository

git clone https://github.com/yourusername/collaborative-task-manager.git
cd collaborative-task-manager/backend

# Install dependencies

npm install

# Environment configuration

cp .env.example .env

# Configure your .env file:

NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
SOCKET_CORS_ORIGIN=http://localhost:3000

# Database setup

npx prisma generate
npx prisma db push

# Optional: Seed database

npm run seed

# Start development server

npm run dev

```

### **Frontend Setup**
```

cd ../frontend

# Install dependencies

npm install

# Environment configuration

cp .env.example .env.local

# Configure your .env.local file:

NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Start development server

npm run dev

```

### **Access Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Database Studio**: `npx prisma studio` (http://localhost:5555)

## 🌍 **Environment Variables**

### **Backend (.env)**
```

NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://your-database-url
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
SOCKET_CORS_ORIGIN=https://your-frontend-domain.vercel.app
FRONTEND_URL=https://your-frontend-domain.vercel.app

```

### **Frontend (.env.local)**
```

NEXT_PUBLIC_API_URL=https://your-backend-domain.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend-domain.onrender.com

```

## 📚 **API Contract Documentation**

### **Authentication Endpoints**
```

POST /api/auth/register

# Body: { name: string, email: string, password: string }

# Response: { user: User, token: string }

POST /api/auth/login

# Body: { email: string, password: string }

# Response: { user: User, token: string }

GET /api/auth/profile

# Headers: Authorization: Bearer <token>

# Response: { user: User }

PUT /api/auth/profile

# Headers: Authorization: Bearer <token>

# Body: { name?: string, email?: string }

# Response: { user: User }

```

### **Task Management Endpoints**
```

GET /api/tasks

# Query: ?page=1\&limit=10\&status=TODO\&priority=HIGH\&sortBy=dueDate

# Response: { tasks: Task[], total: number, page: number }

POST /api/tasks

# Headers: Authorization: Bearer <token>

# Body: { title: string, description?: string, priority?: Priority, dueDate?: Date, assignedToId?: string }

# Response: { task: Task }

GET /api/tasks/:id

# Headers: Authorization: Bearer <token>

# Response: { task: Task }

PUT /api/tasks/:id

# Headers: Authorization: Bearer <token>

# Body: { title?: string, description?: string, status?: Status, priority?: Priority, dueDate?: Date, assignedToId?: string }

# Response: { task: Task }

DELETE /api/tasks/:id

# Headers: Authorization: Bearer <token>

# Response: { message: string }

GET /api/tasks/stats

# Headers: Authorization: Bearer <token>

# Response: { total: number, completed: number, overdue: number, byStatus: object }

```

### **User Management Endpoints**
```

GET /api/users

# Headers: Authorization: Bearer <token>

# Response: { users: User[] }

GET /api/users/:id/tasks

# Headers: Authorization: Bearer <token>

# Response: { tasks: Task[] }

```

## 🚀 **Deployment Guide**

### **Backend Deployment (Render)**
1. **Connect Repository**: Link GitHub repository to Render
2. **Environment Variables**: Set all production environment variables
3. **Build Settings**:
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
4. **Database**: Create PostgreSQL database on Render
5. **Deploy**: Automatic deployment on git push

### **Frontend Deployment (Vercel)**
1. **Connect Repository**: Link GitHub repository to Vercel
2. **Framework Detection**: Vercel auto-detects Next.js
3. **Environment Variables**: Set production environment variables
4. **Build Settings**: Auto-configured for Next.js
5. **Deploy**: Automatic deployment on git push

### **Domain Configuration**
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.onrender.com`
- **CORS**: Update backend CORS_ORIGIN with frontend URL

## 🧪 **Testing**

### **Backend Tests**
```

cd backend

# Run all tests

npm test

# Run with coverage

npm run test:coverage

# Run specific test suite

npm test -- --testNamePattern="AuthService"

```

### **Test Coverage**
- **Unit Tests**: Service layer business logic (Task creation, User authentication, JWT handling)
- **Integration Tests**: API endpoint testing with test database
- **Real-time Tests**: Socket.io event handling and broadcasting

### **Example Test Cases**
```

// Task Service Tests
describe('TaskService', () => {
it('should create task with valid data', async () => {
const taskData = { title: 'Test Task', creatorId: 'user123' }
const result = await TaskService.createTask(taskData)
expect(result.title).toBe('Test Task')
})

it('should validate title length constraint', async () => {
const taskData = { title: 'x'.repeat(101), creatorId: 'user123' }
await expect(TaskService.createTask(taskData)).rejects.toThrow('Title too long')
})
})

```

## 🔒 **Security Implementation**

### **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **HttpOnly Cookies**: Secure token storage
- **Route Protection**: Middleware-based authorization

### **Input Validation**  
- **Zod Schemas**: Runtime type checking and validation
- **SQL Injection Protection**: Prisma ORM parameterized queries
- **XSS Prevention**: Input sanitization and output encoding

### **Infrastructure Security**
- **CORS Configuration**: Restricted cross-origin requests
- **Rate Limiting**: API endpoint protection
- **Environment Variables**: Secure secret management
- **HTTPS**: SSL/TLS encryption in production

## 📈 **Performance Optimizations**

### **Database Performance**
- **Connection Pooling**: Prisma connection management
- **Query Optimization**: Efficient joins and indexes
- **Pagination**: Large dataset handling
- **Caching**: Query result caching strategies

### **Frontend Performance**
- **Static Generation**: Next.js pre-rendered pages
- **Code Splitting**: Automatic bundle optimization
- **Image Optimization**: Next.js built-in image optimization
- **Lazy Loading**: Component-level lazy loading

### **Real-time Performance**
- **Connection Management**: Efficient Socket.io connections
- **Event Throttling**: Prevent excessive real-time updates
- **Room Management**: Targeted event broadcasting

## 🔧 **Development Commands**

### **Backend Commands**
```

npm run dev          \# Start development server
npm run build        \# Build for production
npm run start        \# Start production server
npm run type-check   \# TypeScript type checking
npm test             \# Run test suite
npm run test:watch   \# Watch mode testing
npm run prisma:studio \# Database GUI
npm run prisma:generate \# Generate Prisma client

```

### **Frontend Commands**
```

npm run dev          \# Start development server
npm run build        \# Build for production
npm run start        \# Start production server
npm run lint         \# Run ESLint
npm run type-check   \# TypeScript checking

```
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

## 🤝 **Trade-offs & Design Decisions**

### **Technology Choices**
- **PostgreSQL vs MongoDB**: Chose PostgreSQL for ACID compliance and complex relationships
- **Prisma vs Raw SQL**: Prisma for type safety and developer experience
- **JWT vs Sessions**: JWT for stateless authentication and better scalability
- **Socket.io vs WebSockets**: Socket.io for automatic fallbacks and better browser support

### **Architecture Trade-offs**
- **Monorepo vs Separate Repos**: Separate repos for independent deployment
- **Server-side vs Client-side Rendering**: Hybrid approach with Next.js
- **Real-time Updates**: Chose Socket.io over polling for better performance

### **Performance vs Complexity**
- **Optimistic Updates**: Better UX at cost of complexity
- **Type Safety**: Comprehensive TypeScript at cost of development time
- **Real-time Features**: Enhanced collaboration with infrastructure complexity

## 🔮 **Future Enhancements**

- **File Attachments**: Task file upload functionality
- **Team Management**: User roles and permissions
- **Advanced Analytics**: Task completion trends and productivity metrics
- **Mobile App**: React Native mobile application
- **Offline Support**: PWA with offline task management
- **Audit Logging**: Complete action history and version control

## 👥 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)  
5. Open Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Next.js Team** for the excellent React framework
- **Prisma Team** for the outstanding ORM experience
- **Vercel & Render** for seamless deployment platforms
- **Socket.io Contributors** for real-time communication capabilities

---

**Built with ❤️ by [Vishwanath Nishad] **
```

