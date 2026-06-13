/**
 * Database Seeder — creates/resets default test accounts
 * Run: npm run seed
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SEED_ACCOUNTS = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'superadmin@doctorhub.com',
    password: 'Admin@12345',
    role: 'super_admin',
  },
  {
    firstName: 'Platform',
    lastName: 'Admin',
    email: 'admin@doctorhub.com',
    password: 'Admin@12345',
    role: 'admin',
  },
  {
    firstName: 'Medical',
    lastName: 'Assistant',
    email: 'assistant@doctorhub.com',
    password: 'Assistant@123',
    role: 'assistant',
  },
  {
    firstName: 'Test',
    lastName: 'Patient',
    email: 'patient@doctorhub.com',
    password: 'Patient@123',
    role: 'patient',
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const { default: User } = await import('../models/User.js');
    const { default: MedicalHistory } = await import('../models/MedicalHistory.js');

    for (const account of SEED_ACCOUNTS) {
      const existing = await User.findOne({ email: account.email }).select('+password');

      if (existing) {
        existing.password = account.password;
        existing.role = account.role;
        existing.isEmailVerified = true;
        existing.isActive = true;
        existing.isSuspended = false;
        existing.loginAttempts = 0;
        existing.lockUntil = undefined;
        await existing.save();
        console.log(`🔄 Reset account: ${account.email}`);
      } else {
        const user = await User.create({
          firstName: account.firstName,
          lastName: account.lastName,
          email: account.email,
          password: account.password,
          role: account.role,
          isEmailVerified: true,
          isActive: true,
        });

        if (account.role === 'patient') {
          await MedicalHistory.create({ patient: user._id });
        }

        console.log(`✅ Created account: ${account.email}`);
      }
    }

    console.log('\n🎉 Seeding complete!');
    console.log('\n📋 Test Accounts:');
    console.log('   Super Admin: superadmin@doctorhub.com / Admin@12345');
    console.log('   Admin:       admin@doctorhub.com / Admin@12345');
    console.log('   Assistant:   assistant@doctorhub.com / Assistant@123');
    console.log('   Patient:     patient@doctorhub.com / Patient@123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder failed:', err.message);
    process.exit(1);
  }
};

run();
