
````markdown
# 🚀 Collaborative Task Manager

A full-stack web application for collaborative task management with real-time updates, built with modern technologies and deployed to production.

---

## 🌐 Live Application

- **Frontend**: [https://collaborative-task-manager-fc26.vercel.app](https://collaborative-task-manager-fc26.vercel.app)
- **Backend API**: [https://collaborative-task-manager-3jhp.onrender.com](https://collaborative-task-manager-3jhp.onrender.com)

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** with App Router  
- **TypeScript** for type safety  
- **Tailwind CSS** for responsive styling  
- **React Hook Form** for form management and validation  
- **Zod** for schema validation  
- **Socket.io Client** for real-time updates  

### Backend
- **Node.js** with Express.js  
- **TypeScript** for backend type safety  
- **Prisma ORM** for database operations  
- **Socket.io** for real-time communication  
- **JWT** for authentication  
- **bcryptjs** for password hashing  
- **Zod** for DTO validation  

### Database
- **PostgreSQL** (Production: Render PostgreSQL)  
- **Prisma** as ORM with migration support  

### Deployment
- **Frontend**: Vercel  
- **Backend**: Render  
- **Database**: Render PostgreSQL  

---

## 🗄️ Database Architecture Decision

### PostgreSQL vs MongoDB: Why We Chose PostgreSQL

We migrated from MongoDB to PostgreSQL during development for several critical reasons:

#### 1. ACID Compliance & Data Integrity
- **PostgreSQL**: Full ACID transactions ensure data consistency across task assignments  
- **Critical Need**: When multiple users simultaneously assign/update tasks, PostgreSQL prevents race conditions and data corruption  
- **MongoDB Limitation**: Eventual consistency model could lead to conflicting task states  

#### 2. Complex Relational Queries
- **Task Management Requirements**: Our app needs complex joins between users, tasks, and assignments  
- **PostgreSQL Advantage**: Native support for foreign keys, cascading deletes, and optimized JOIN operations  
- **Performance**: Significantly faster for dashboard analytics and user-specific task filtering  

#### 3. TypeScript Integration Excellence
- **Prisma + PostgreSQL**: Auto-generated TypeScript types with compile-time safety  
- **Developer Experience**: IntelliSense support, zero runtime type errors  
- **Schema Evolution**: Type-safe database migrations and schema changes  

#### 4. Real-Time Constraints
- **Consistent Reads**: PostgreSQL ensures all users see the same task state immediately after updates  
- **Socket.io Integration**: Reliable triggers for real-time notifications without data inconsistencies  

#### 5. Production Scalability
- **Connection Pooling**: Superior connection management for concurrent users  
- **Query Optimization**: Advanced indexing and query planning for large task datasets  
- **Cloud Support**: Better support on modern platforms (Render, Vercel, Railway)  

---

## 📊 Database Schema

```prisma
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

model Task {
  id          String    @id @default(cuid())
  title       String    @db.VarChar(100)
  description String?
  status      Status    @default(TODO)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime? @map("due_date")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  creatorId    String  @map("creator_id")
  assignedToId String? @map("assigned_to_id")

  creator    User  @relation("TaskCreator", fields: [creatorId], references: [id], onDelete: Cascade)
  assignedTo User? @relation("TaskAssignee", fields: [assignedToId], references: [id], onDelete: SetNull)
  @@map("tasks")
}

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
````

---

## 🏗️ Architecture Overview

### Backend Architecture Pattern

We implemented a **Service–Repository pattern** with clear separation of concerns:

```
Controllers/     ← HTTP request handling & validation
├── Services/    ← Business logic & data transformation
├── Repositories/← Data access layer (Prisma)
├── DTOs/        ← Data Transfer Objects (Zod validation)
├── Middleware/  ← Authentication, CORS, logging
└── Utils/       ← Helper functions & utilities
```

#### DTO Validation Strategy

* **Zod Schemas**: Type-safe input validation for all endpoints
* **CreateTaskDto**: Validates task creation with title length limits (100 chars)
* **UpdateTaskDto**: Partial validation for task updates
* **UserRegistrationDto**: Email validation and password strength requirements

#### JWT Implementation

* **HttpOnly Cookies**: Secure token storage (not localStorage)
* **Refresh Token Rotation**: Enhanced security with token refresh
* **Middleware Protection**: Route-level authentication guards

---

### Frontend Architecture

* **App Router**: Next.js 13+ file-based routing
* **Component Structure**: Modular, reusable React components
* **State Management**: Server state via React Query, client state via useState/useContext
* **Real-time Integration**: Socket.io client with connection status management

---

## 🔄 Socket.io Real-Time Implementation

### Real-Time Features

* Live Task Updates
* Assignment Notifications
* Status Changes
* Connection Management

### Socket.io Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Backend       │────│   Database      │
│   (Next.js)     │    │   (Express.js)  │    │   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │
        │
        └──────── Socket.io (Real-time sync)
```

**Server-side Example:**

```ts
socket.on('join_user_room', (userId) => {
  socket.join(`user_${userId}`)
})

socket.on('task_updated', (taskData) => {
  socket.broadcast.emit('task_change', taskData)
  if (taskData.assignedToId) {
    socket.to(`user_${taskData.assignedToId}`).emit('task_assigned', taskData)
  }
})
```

---

## 🚀 Features

### Core Functionality

✅ Authentication (JWT + HttpOnly Cookies)
✅ Task CRUD Operations
✅ Real-time Collaboration
✅ Task Assignment
✅ Priority & Status Tracking
✅ Due Date Management
✅ Dashboard Views
✅ Filtering & Sorting

### Advanced Features

✅ Responsive Design (Tailwind)
✅ Error Handling
✅ Type Safety
✅ Input Validation (Zod)
✅ Security (bcrypt, JWT, CORS)

---

## 🛠️ Local Development Setup

### Prerequisites

* Node.js 18+
* PostgreSQL
* Git
* npm or yarn

### Backend Setup

```bash
git clone https://github.com/yourusername/collaborative-task-manager.git
cd collaborative-task-manager/backend

npm install
cp .env.example .env
# configure .env accordingly

npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 📁 Project Structure

```
collaborative-task-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── sockets/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   └── utils/
│   ├── package.json
│   └── next.config.js
└── docs/
```

---

## 🔮 Future Enhancements

* File Attachments
* Team Management
* Advanced Analytics
* Mobile App (React Native)
* Offline Support (PWA)
* Audit Logging

---

## 👥 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m "Add AmazingFeature"`)
4. Push (`git push origin feature/AmazingFeature`)
5. Open a PR

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

* **Next.js Team** for the framework
* **Prisma Team** for ORM
* **Vercel & Render** for deployment
* **Socket.io Contributors** for real-time magic

---

**Built with ❤️ by [Vishwanath Nishad]**

