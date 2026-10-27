// API client helper for Personal Expense Tracker
const API_BASE = '/api';

const api = {
  // Helper to handle fetch responses and extract JSON errors
  async handleResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data.error || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }
    return data;
  },

  // Get transactions with optional query filters
  async getTransactions(filters = {}) {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/transactions${queryString}`);
    return this.handleResponse(res);
  },

  // Get single transaction by ID
  async getTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`);
    return this.handleResponse(res);
  },

  // Create a new transaction
  async createTransaction(transactionData) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return this.handleResponse(res);
  },

  // Update an existing transaction
  async updateTransaction(id, transactionData) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transactionData)
    });
    return this.handleResponse(res);
  },

  // Delete a transaction
  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    });
    return this.handleResponse(res);
  },

  // Get dashboard summary (totalIncome, totalExpense, balance)
  async getSummary(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/analytics/summary${queryString}`);
    return this.handleResponse(res);
  },

  // Get expense totals grouped by category
  async getCategoryBreakdown(filters = {}) {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/analytics/categories${queryString}`);
    return this.handleResponse(res);
  },

  // Get monthly comparison data for bar chart
  async getMonthlyComparison() {
    const res = await fetch(`${API_BASE}/analytics/monthly`);
    return this.handleResponse(res);
  }
};
