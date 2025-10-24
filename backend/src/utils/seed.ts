import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { config } from '../config/env';

const seedDatabase = async () => {
  try {
    await connectDatabase();
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('💡 Database already has users, skipping seed');
      return;
    }
    
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123'
      }
    ];
    
    await User.create(sampleUsers);
    console.log('✅ Sample users created successfully');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run seed if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
