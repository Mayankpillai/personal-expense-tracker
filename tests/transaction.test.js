// Automated API & Unit Tests for Personal Expense Tracker
// Using Node.js built-in test runner (node:test) and assertions (node:assert)

const { test, describe, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const app = require('../src/app');
const Transaction = require('../src/models/Transaction');

let server;
let baseUrl;

describe('Expense Tracker API & Functional Tests', () => {
  before(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/expense_tracker_test';
    await mongoose.connect(mongoUri);

    // Start ephemeral server
    await new Promise(resolve => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
  });

  after(async () => {
    // Clean up database and close server
    if (mongoose.connection.readyState !== 0) {
      await Transaction.deleteMany({});
      await mongoose.connection.close();
    }
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  beforeEach(async () => {
    // Reset collection before each test
    await Transaction.deleteMany({});
  });

  // T01: Create valid expense
  test('T01: Should create a valid expense transaction', async () => {
    const res = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'expense',
        amount: 500,
        category: 'Food',
        date: '2026-10-25',
        note: 'College cafeteria lunch'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.type, 'expense');
    assert.equal(data.amount, 500);
    assert.equal(data.category, 'Food');
    assert.equal(data.note, 'College cafeteria lunch');
    assert.ok(data._id);
  });

  // T02: Create valid income
  test('T02: Should create a valid income transaction', async () => {
    const res = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'income',
        amount: 15000,
        category: 'Salary',
        date: '2026-10-01',
        note: 'Monthly internship stipend'
      })
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.type, 'income');
    assert.equal(data.amount, 15000);
    assert.equal(data.category, 'Salary');
  });

  // T03: Submit missing category/date/amount (Validation Error)
  test('T03: Should reject missing amount or negative amount with 400 Bad Request', async () => {
    // Missing amount
    const res1 = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'expense',
        category: 'Shopping',
        date: '2026-10-25'
      })
    });
    assert.equal(res1.status, 400);
    const data1 = await res1.json();
    assert.ok(data1.error);

    // Negative amount
    const res2 = await fetch(`${baseUrl}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'expense',
        amount: -250,
        category: 'Shopping',
        date: '2026-10-25'
      })
    });
    assert.equal(res2.status, 400);
    const data2 = await res2.json();
    assert.ok(data2.error);
  });

  // T04: Read transaction list
  test('T04: Should retrieve saved transactions list', async () => {
    await Transaction.create([
      { type: 'expense', amount: 300, category: 'Travel', date: new Date('2026-10-20') },
      { type: 'income', amount: 5000, category: 'Freelance', date: new Date('2026-10-21') }
    ]);

    const res = await fetch(`${baseUrl}/transactions`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.length, 2);
  });

  // T05: Update amount or category
  test('T05: Should update transaction amount and category', async () => {
    const created = await Transaction.create({
      type: 'expense',
      amount: 500,
      category: 'Food',
      date: new Date('2026-10-20'),
      note: 'Dinner'
    });

    const res = await fetch(`${baseUrl}/transactions/${created._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 650,
        category: 'Food',
        note: 'Dinner with friends'
      })
    });

    assert.equal(res.status, 200);
    const updated = await res.json();
    assert.equal(updated.amount, 650);
    assert.equal(updated.note, 'Dinner with friends');
  });

  // T06: Delete a transaction
  test('T06: Should delete a transaction successfully', async () => {
    const created = await Transaction.create({
      type: 'expense',
      amount: 120,
      category: 'Bills',
      date: new Date('2026-10-22')
    });

    const res = await fetch(`${baseUrl}/transactions/${created._id}`, {
      method: 'DELETE'
    });

    assert.equal(res.status, 200);
    const found = await Transaction.findById(created._id);
    assert.equal(found, null);
  });

  // T07: Request unknown transaction ID
  test('T07: Should return 404 for unknown or missing transaction ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await fetch(`${baseUrl}/transactions/${fakeId}`);
    assert.equal(res.status, 404);
    const data = await res.json();
    assert.ok(data.error);
  });

  // T08: Filter by category, type, and date
  test('T08: Should filter transactions by type and category', async () => {
    await Transaction.create([
      { type: 'expense', amount: 100, category: 'Food', date: new Date('2026-10-10') },
      { type: 'expense', amount: 200, category: 'Travel', date: new Date('2026-10-12') },
      { type: 'income', amount: 3000, category: 'Salary', date: new Date('2026-10-15') }
    ]);

    // Filter by type=expense
    const resType = await fetch(`${baseUrl}/transactions?type=expense`);
    const dataExpense = await resType.json();
    assert.equal(dataExpense.length, 2);

    // Filter by category=Travel
    const resCat = await fetch(`${baseUrl}/transactions?category=Travel`);
    const dataTravel = await resCat.json();
    assert.equal(dataTravel.length, 1);
    assert.equal(dataTravel[0].category, 'Travel');
  });

  // T09: Analytics when no transactions exist
  test('T09: Summary returns zero totals and empty state when no transactions exist', async () => {
    const res = await fetch(`${baseUrl}/analytics/summary`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.totalIncome, 0);
    assert.equal(data.totalExpense, 0);
    assert.equal(data.balance, 0);
    assert.equal(data.transactionCount, 0);
  });

  // T12: Analytics calculations (Income, Expense, Balance)
  test('T12: Should calculate summary totals accurately', async () => {
    await Transaction.create([
      { type: 'income', amount: 10000, category: 'Salary', date: new Date('2026-10-01') },
      { type: 'income', amount: 2500, category: 'Freelance', date: new Date('2026-10-05') },
      { type: 'expense', amount: 3000, category: 'Rent', date: new Date('2026-10-02') },
      { type: 'expense', amount: 1500, category: 'Food', date: new Date('2026-10-10') }
    ]);

    const res = await fetch(`${baseUrl}/analytics/summary`);
    assert.equal(res.status, 200);
    const data = await res.json();

    assert.equal(data.totalIncome, 12500);
    assert.equal(data.totalExpense, 4500);
    assert.equal(data.balance, 8000);
    assert.equal(data.transactionCount, 4);
  });

  // Category analytics breakdown
  test('T12b: Category breakdown aggregates expenses by category', async () => {
    await Transaction.create([
      { type: 'expense', amount: 1500, category: 'Food', date: new Date('2026-10-10') },
      { type: 'expense', amount: 500, category: 'Food', date: new Date('2026-10-12') },
      { type: 'expense', amount: 800, category: 'Travel', date: new Date('2026-10-15') }
    ]);

    const res = await fetch(`${baseUrl}/analytics/categories`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.length, 2);
    assert.equal(data[0].category, 'Food');
    assert.equal(data[0].total, 2000);
    assert.equal(data[1].category, 'Travel');
    assert.equal(data[1].total, 800);
  });

  // Monthly analytics comparison
  test('T12c: Monthly comparison groups transactions by month', async () => {
    await Transaction.create([
      { type: 'income', amount: 20000, category: 'Salary', date: new Date('2026-09-01') },
      { type: 'expense', amount: 5000, category: 'Rent', date: new Date('2026-09-05') },
      { type: 'income', amount: 22000, category: 'Salary', date: new Date('2026-10-01') }
    ]);

    const res = await fetch(`${baseUrl}/analytics/monthly`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.length, 2);
    assert.equal(data[0].period, '2026-09');
    assert.equal(data[0].income, 20000);
    assert.equal(data[0].expense, 5000);
    assert.equal(data[1].period, '2026-10');
    assert.equal(data[1].income, 22000);
  });

  // T12d: Day-wise expenses for a selected month
  test('T12d: Daily expenses returns day-wise spending for selected month', async () => {
    await Transaction.create([
      { type: 'expense', amount: 8000, category: 'Rent', date: new Date('2026-10-02') },
      { type: 'expense', amount: 1500, category: 'Food', date: new Date('2026-10-02') },
      { type: 'expense', amount: 500, category: 'Travel', date: new Date('2026-10-10') }
    ]);

    const res = await fetch(`${baseUrl}/analytics/daily?month=2026-10`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.selectedMonth, '2026-10');
    assert.equal(data.totalExpense, 10000);
    assert.ok(Array.isArray(data.days));
    assert.equal(data.days.length, 31);

    // Day 2 should have 8000 + 1500 = 9500
    const day2 = data.days.find(d => d.day === 2);
    assert.equal(day2.amount, 9500);

    // Day 10 should have 500
    const day10 = data.days.find(d => d.day === 10);
    assert.equal(day10.amount, 500);
  });

  // T13: Health check endpoint
  test('T13: Health endpoint returns status ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'ok');
  });
});
