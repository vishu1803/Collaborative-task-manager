// MongoDB initialization script for Docker
db = db.getSiblingDB('task-manager');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.tasks.createIndex({ creatorId: 1 });
db.tasks.createIndex({ assignedToId: 1 });
db.tasks.createIndex({ status: 1 });
db.tasks.createIndex({ priority: 1 });
db.tasks.createIndex({ dueDate: 1 });
db.tasks.createIndex({ createdAt: -1 });

print('Database initialized with indexes');
