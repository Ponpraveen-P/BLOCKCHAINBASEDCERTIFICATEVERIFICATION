import { connectDB, User, Student, getDatabaseMode } from '../utils/db.js';

const test = async () => {
  console.log('Test starting...');
  await connectDB();
  console.log('Database Mode:', getDatabaseMode());
  
  try {
    console.log('Counting users...');
    const count = await User.countDocuments({ role: 'admin' });
    console.log('Admin user count:', count);
    
    if (count === 0) {
      console.log('Creating admin...');
      const admin = await User.create({
        name: 'Test Admin',
        email: 'admin@college.edu',
        password: 'hashedpassword',
        role: 'admin'
      });
      console.log('Admin created:', admin);
      
      const newCount = await User.countDocuments({ role: 'admin' });
      console.log('New count:', newCount);
    }
  } catch (e) {
    console.error('Error during database operations:', e);
  }
  
  process.exit(0);
};

test();
