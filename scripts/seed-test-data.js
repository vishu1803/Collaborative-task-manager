const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/task-manager-test';

// User schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

// Task schema  
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], required: true },
  status: { type: String, enum: ['To Do', 'In Progress', 'Review', 'Completed'], default: 'To Do' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedToId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);

async function seedTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to test database');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing test data');

    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: hashedPassword,
      },
      {
        name: 'Test User 1',
        email: 'user1@test.com', 
        password: hashedPassword,
      },
      {
        name: 'Test User 2',
        email: 'user2@test.com',
        password: hashedPassword,
      }
    ]);
    console.log('Created test users');

    // Create test tasks
    const tasks = await Task.insertMany([
      {
        title: 'Sample Task 1',
        description: 'This is a sample task for testing',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'High',
        status: 'To Do',
        creatorId: users[0]._id,
        assignedToId: users[1]._id,
      },
      {
        title: 'Sample Task 2', 
        description: 'Another sample task',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        priority: 'Medium',
        status: 'In Progress',
        creatorId: users[0]._id,
        assignedToId: users[2]._id,
      },
      {
        title: 'Overdue Task',
        description: 'This task is overdue',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        priority: 'Urgent',
        status: 'To Do',
        creatorId: users[1]._id,
        assignedToId: users[0]._id,
      }
    ]);
    console.log('Created test tasks');

    console.log('✅ Test data seeding completed successfully');
    
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedTestData();
