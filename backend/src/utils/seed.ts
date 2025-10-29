import { connectDatabase, disconnectDatabase, prisma } from '../config/database';
import * as bcrypt from 'bcryptjs';
import { Priority, Status } from '@prisma/client';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    await connectDatabase();
    
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
      console.log('💡 Database already has users, skipping seed');
      return;
    }
    
    console.log('📦 Creating sample users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await prisma.user.createMany({
      data: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: hashedPassword
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: hashedPassword
        },
        {
          name: 'Mike Johnson',
          email: 'mike@example.com',
          password: hashedPassword
        },
        {
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          password: hashedPassword
        }
      ]
    });
    
    console.log(`✅ Created ${users.count} sample users`);
    
    const createdUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    
    console.log('📋 Creating sample tasks...');
    
    const taskData = [
      {
        title: 'Setup Project Environment',
        description: 'Initialize the development environment and install all necessary dependencies',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: Priority.HIGH,
        status: Status.TODO,
        creatorId: createdUsers[0]?.id || '',
        assignedToId: createdUsers[1]?.id || '',
      },
      {
        title: 'Design Database Schema',
        description: 'Create comprehensive database schema for the task management system',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: Priority.MEDIUM,
        status: Status.IN_PROGRESS,
        creatorId: createdUsers[0]?.id || '',
        assignedToId: createdUsers[2]?.id || '',
      },
      {
        title: 'Implement User Authentication',
        description: 'Build secure user authentication system with JWT tokens',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: Priority.HIGH,
        status: Status.REVIEW,
        creatorId: createdUsers[1]?.id || '',
        assignedToId: createdUsers[0]?.id || '',
      },
      {
        title: 'Write API Documentation',
        description: 'Document all API endpoints with examples and response formats',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        priority: Priority.LOW,
        status: Status.TODO,
        creatorId: createdUsers[1]?.id || '',
        assignedToId: createdUsers[3]?.id || '',
      },
      {
        title: 'Setup CI/CD Pipeline',
        description: 'Configure continuous integration and deployment pipeline',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        priority: Priority.URGENT,
        status: Status.TODO,
        creatorId: createdUsers[2]?.id || '',
        assignedToId: createdUsers[1]?.id || '',
      },
      {
        title: 'Code Review and Testing',
        description: 'Review code quality and implement comprehensive testing',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        priority: Priority.HIGH,
        status: Status.COMPLETED,
        creatorId: createdUsers[2]?.id || '',
        assignedToId: createdUsers[3]?.id || '',
      }
    ];
    
    const validTaskData = taskData.filter(task => task.creatorId && task.assignedToId);
    
    if (validTaskData.length > 0) {
      const tasks = await prisma.task.createMany({
        data: validTaskData
      });
      
      console.log(`✅ Created ${tasks.count} sample tasks`);
    }
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Seeding Summary:');
    console.log(`👥 Users: ${users.count}`);
    console.log(`📋 Tasks: ${validTaskData.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Sample Login Credentials:');
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email} | Password: password123`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

const seedDevelopmentDatabase = async () => {
  try {
    console.log('🌱 Starting development database seeding...');
    
    await connectDatabase();
    
    console.log('🗑️  Clearing existing data...');
    await prisma.task.deleteMany();
    await prisma.user.deleteMany();
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await prisma.user.createMany({
      data: [
        { name: 'Admin User', email: 'admin@taskmanager.com', password: hashedPassword },
        { name: 'John Doe', email: 'john@example.com', password: hashedPassword },
        { name: 'Jane Smith', email: 'jane@example.com', password: hashedPassword },
        { name: 'Mike Johnson', email: 'mike@example.com', password: hashedPassword },
        { name: 'Sarah Wilson', email: 'sarah@example.com', password: hashedPassword },
        { name: 'David Brown', email: 'david@example.com', password: hashedPassword },
        { name: 'Emily Davis', email: 'emily@example.com', password: hashedPassword },
        { name: 'Alex Taylor', email: 'alex@example.com', password: hashedPassword }
      ]
    });
    
    const createdUsers = await prisma.user.findMany();
    
    const taskPromises = [];
    const priorities = Object.values(Priority);
    const statuses = Object.values(Status);
    
    for (let i = 1; i <= 50; i++) {
      const randomCreator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomAssignee = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const dueDate = new Date(Date.now() + (Math.random() * 40 - 10) * 24 * 60 * 60 * 1000);
      
      if (randomCreator && randomAssignee && randomPriority) {
        taskPromises.push(prisma.task.create({
          data: {
            title: `Task ${i}: ${getRandomTaskTitle()}`,
            description: getRandomTaskDescription(),
            dueDate,
            priority: randomPriority,
            status: randomStatus || Status.TODO, // ✅ Fixed: Added fallback
            creatorId: randomCreator.id,
            assignedToId: randomAssignee.id,
          }
        }));
      }
    }
    
    await Promise.all(taskPromises);
    
    console.log(`✅ Created comprehensive development data`);
    console.log(`👥 Users: ${users.count}`);
    console.log(`📋 Tasks: ${taskPromises.length}`);
    
  } catch (error) {
    console.error('❌ Development seeding failed:', error);
    throw error;
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

const getRandomTaskTitle = (): string => {
  const titles = [
    'Implement new feature',
    'Fix critical bug',
    'Update documentation',
    'Code review',
    'Database optimization',
    'UI/UX improvements',
    'Security audit',
    'Performance testing',
    'Integration testing',
    'Deploy to production'
  ];
  return titles[Math.floor(Math.random() * titles.length)] || 'Default Task';
};

const getRandomTaskDescription = (): string => {
  const descriptions = [
    'This task requires immediate attention and should be completed as soon as possible.',
    'A comprehensive task that involves multiple steps and coordination with team members.',
    'Important maintenance task to ensure system stability and performance.',
    'Enhancement to improve user experience and application functionality.',
    'Critical issue that needs to be resolved before the next release.',
    'Routine task that helps maintain code quality and documentation.',
    'Strategic task aligned with project goals and timeline.',
    'Technical debt reduction to improve long-term maintainability.'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)] || 'Default Description';
};

const runSeeder = async () => {
  const seedType = process.argv[2] || 'basic';
  
  switch (seedType) {
    case 'dev':
    case 'development':
      await seedDevelopmentDatabase();
      break;
    case 'basic':
    default:
      await seedDatabase();
      break;
  }
};

if (require.main === module) {
  runSeeder().catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
  });
}

export { seedDatabase, seedDevelopmentDatabase };
