import mongoose from 'mongoose';
import { config } from '../infrastructure/config';
import { UserModel } from '../infrastructure/database/mongoose/models/UserModel';
import { TransactionModel } from '../infrastructure/database/mongoose/models/TransactionModel';
import { hashPassword } from '../shared/utils/password';

/**
 * Database Seeder
 * Creates default users (admin, analyst, viewer) and sample financial records
 */
const seed = async (): Promise<void> => {
  try {
    console.log(' Starting database seed...');

    await mongoose.connect(config.mongodb.uri);
    console.log(' Connected to MongoDB');

    // Clear existing data
    await Promise.all([UserModel.deleteMany({}), TransactionModel.deleteMany({})]);
    console.log(' Cleared existing data');

    // Create Users
    const hashedPassword = await hashPassword('Admin@123');

    const admin = await UserModel.create({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isActive: true,
    });
    console.log(' Created admin user');

    const analyst = await UserModel.create({
      email: 'analyst@example.com',
      password: hashedPassword,
      firstName: 'Finance',
      lastName: 'Analyst',
      role: 'analyst',
      isActive: true,
    });
    console.log(' Created analyst user');

    await UserModel.create({
      email: 'viewer@example.com',
      password: hashedPassword,
      firstName: 'Dashboard',
      lastName: 'Viewer',
      role: 'viewer',
      isActive: true,
    });
    console.log(' Created viewer user');

    // Create Sample Financial Records
    const now = new Date();

    const sampleTransactions = [
      // Income
      {
        userId: admin._id,
        amount: 50000,
        type: 'income',
        category: 'salary',
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        notes: 'Monthly salary',
      },
      {
        userId: analyst._id,
        amount: 8000,
        type: 'income',
        category: 'freelance',
        date: new Date(now.getFullYear(), now.getMonth(), 10),
        notes: 'Freelance project payment',
      },
      {
        userId: admin._id,
        amount: 2000,
        type: 'income',
        category: 'investments',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        notes: 'Dividend income',
      },
      // Expenses
      {
        userId: admin._id,
        amount: 12000,
        type: 'expense',
        category: 'rent',
        date: new Date(now.getFullYear(), now.getMonth(), 2),
        notes: 'Monthly rent',
      },
      {
        userId: admin._id,
        amount: 4500,
        type: 'expense',
        category: 'groceries',
        date: new Date(now.getFullYear(), now.getMonth(), 5),
        notes: 'Monthly groceries',
      },
      {
        userId: analyst._id,
        amount: 1500,
        type: 'expense',
        category: 'utilities',
        date: new Date(now.getFullYear(), now.getMonth(), 7),
        notes: 'Electricity and internet',
      },
      {
        userId: admin._id,
        amount: 3000,
        type: 'expense',
        category: 'transport',
        date: new Date(now.getFullYear(), now.getMonth(), 12),
        notes: 'Fuel and cab expenses',
      },
      // Previous month records for trend data
      {
        userId: admin._id,
        amount: 50000,
        type: 'income',
        category: 'salary',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        notes: 'Monthly salary',
      },
      {
        userId: admin._id,
        amount: 18000,
        type: 'expense',
        category: 'rent',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 2),
        notes: 'Monthly rent',
      },
      {
        userId: admin._id,
        amount: 5000,
        type: 'expense',
        category: 'groceries',
        date: new Date(now.getFullYear(), now.getMonth() - 1, 8),
        notes: 'Monthly groceries',
      },
    ];

    await TransactionModel.insertMany(sampleTransactions);
    console.log(` Created ${sampleTransactions.length} sample financial records`);

    console.log(`
                                                            
   Database seeding completed successfully!              
                                                            
   Default Users:                                           
      
   Admin:    admin@example.com    / Admin@123               
   Analyst:  analyst@example.com  / Admin@123               
   Viewer:   viewer@example.com   / Admin@123               
                                                            
   Role Permissions:                                        
      
   Admin:    Full CRUD on transactions + user management    
   Analyst:  Read transactions + full dashboard access      
   Viewer:   Read transactions only                         
                                                            

    `);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();