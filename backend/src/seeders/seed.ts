import { User, Task } from '../models';
import sequelize from '../config/database';

async function seed() {
  try {
    // Sync database
    await sequelize.sync({ force: true }); // This will recreate tables

    // Create sample users
    const user1 = await User.create({
      email: 'john@example.com',
      name: 'John Doe',
      firebaseUid: 'sample-firebase-uid-1'
    });

    const user2 = await User.create({
      email: 'jane@example.com',
      name: 'Jane Smith',
      firebaseUid: 'sample-firebase-uid-2'
    });

    // Create sample tasks
    await Task.create({
      title: 'Complete Project Setup',
      description: 'Set up the development environment and install dependencies',
      dueDate: new Date('2024-04-25'),
      status: 'pending',
      createdBy: Number(user1.id)
    });

    await Task.create({
      title: 'Database Design',
      description: 'Create database schema and relationships',
      dueDate: new Date('2024-04-26'),
      status: 'in-progress',
      createdBy: Number(user1.id)
    });

    await Task.create({
      title: 'API Documentation',
      description: 'Write Swagger documentation for all endpoints',
      dueDate: new Date('2024-04-27'),
      status: 'completed',
      createdBy: Number(user2.id)
    });

    console.log('Seed data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed(); 