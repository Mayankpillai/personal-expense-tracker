const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Transaction = require('../models/Transaction');

dotenv.config();

const sampleTransactions = [
  {
    type: 'income',
    amount: 35000,
    category: 'Salary',
    date: new Date('2026-09-01'),
    note: 'September Monthly Stipend'
  },
  {
    type: 'expense',
    amount: 8000,
    category: 'Rent',
    date: new Date('2026-09-02'),
    note: 'Hostel / Flat Rent'
  },
  {
    type: 'expense',
    amount: 3200,
    category: 'Food',
    date: new Date('2026-09-12'),
    note: 'Groceries & snacks'
  },
  {
    type: 'expense',
    amount: 1400,
    category: 'Bills',
    date: new Date('2026-09-15'),
    note: 'Mobile & Wi-Fi bill'
  },
  {
    type: 'income',
    amount: 40000,
    category: 'Salary',
    date: new Date('2026-10-01'),
    note: 'October Monthly Stipend'
  },
  {
    type: 'income',
    amount: 6500,
    category: 'Freelance',
    date: new Date('2026-10-08'),
    note: 'Frontend UI design gig'
  },
  {
    type: 'expense',
    amount: 8000,
    category: 'Rent',
    date: new Date('2026-10-02'),
    note: 'Hostel / Flat Rent'
  },
  {
    type: 'expense',
    amount: 2800,
    category: 'Food',
    date: new Date('2026-10-07'),
    note: 'Dinner & College Canteen'
  },
  {
    type: 'expense',
    amount: 1500,
    category: 'Travel',
    date: new Date('2026-10-14'),
    note: 'Metro & Train passes'
  },
  {
    type: 'expense',
    amount: 2100,
    category: 'Shopping',
    date: new Date('2026-10-18'),
    note: 'College books and stationery'
  },
  {
    type: 'expense',
    amount: 1200,
    category: 'Entertainment',
    date: new Date('2026-10-22'),
    note: 'Movie tickets with classmates'
  }
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing records
    await Transaction.deleteMany({});
    console.log('Cleared existing transactions.');

    // Insert sample data
    await Transaction.insertMany(sampleTransactions);
    console.log(`Successfully seeded ${sampleTransactions.length} sample transactions!`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample data:', error.message);
    process.exit(1);
  }
};

seedData();
