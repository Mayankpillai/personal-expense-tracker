// Dashboard coordinator: loading stats, handling filters, and coordinating components

// Display toast message
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}

// Read current active filters
function getActiveFilters() {
  const type = document.getElementById('filterType')?.value || 'all';
  const category = document.getElementById('filterCategory')?.value || 'all';
  const startDate = document.getElementById('filterStartDate')?.value || '';
  const endDate = document.getElementById('filterEndDate')?.value || '';
  const search = document.getElementById('filterSearch')?.value || '';

  return { type, category, startDate, endDate, search };
}

// Update dashboard summary cards
function updateSummaryCards(summary) {
  const incomeEl = document.getElementById('totalIncome');
  const expenseEl = document.getElementById('totalExpense');
  const balanceEl = document.getElementById('netBalance');
  const countEl = document.getElementById('transactionCount');

  if (incomeEl) incomeEl.textContent = formatCurrency(summary.totalIncome || 0);
  if (expenseEl) expenseEl.textContent = formatCurrency(summary.totalExpense || 0);

  if (balanceEl) {
    const balance = summary.balance || 0;
    balanceEl.textContent = formatCurrency(balance);
    // Green if positive, Red if negative
    if (balance >= 0) {
      balanceEl.classList.remove('balance-negative');
      balanceEl.classList.add('balance-positive');
    } else {
      balanceEl.classList.remove('balance-positive');
      balanceEl.classList.add('balance-negative');
    }
  }

  if (countEl) {
    countEl.textContent = summary.transactionCount || 0;
  }
}

// Reload all data (summary, transactions, charts)
async function refreshAll() {
  const filters = getActiveFilters();

  try {
    // 1. Fetch filtered transactions
    const transactions = await api.getTransactions(filters);
    renderTransactionsTable(transactions);

    // 2. Fetch summary totals (respecting date filter)
    const summary = await api.getSummary({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    updateSummaryCards(summary);

    // 3. Fetch category breakdown for doughnut chart
    const categories = await api.getCategoryBreakdown({
      startDate: filters.startDate,
      endDate: filters.endDate
    });
    charts.renderCategoryChart(categories);

    // 4. Fetch monthly income vs expense comparison for bar chart
    const monthly = await api.getMonthlyComparison();
    charts.renderMonthlyChart(monthly);
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
    showToast(error.message || 'Error loading data from server', 'error');
  }
}

// Initialize filter events
function initFilters() {
  const filterType = document.getElementById('filterType');
  const filterCategory = document.getElementById('filterCategory');
  const filterStartDate = document.getElementById('filterStartDate');
  const filterEndDate = document.getElementById('filterEndDate');
  const filterSearch = document.getElementById('filterSearch');
  const resetBtn = document.getElementById('resetFiltersBtn');

  // Trigger refresh on change
  [filterType, filterCategory, filterStartDate, filterEndDate].forEach(el => {
    if (el) el.addEventListener('change', refreshAll);
  });

  // Debounced search input
  let searchTimeout = null;
  if (filterSearch) {
    filterSearch.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(refreshAll, 300);
    });
  }

  // Reset filters button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (filterType) filterType.value = 'all';
      if (filterCategory) filterCategory.value = 'all';
      if (filterStartDate) filterStartDate.value = '';
      if (filterEndDate) filterEndDate.value = '';
      if (filterSearch) filterSearch.value = '';
      refreshAll();
    });
  }
}

// Application startup
document.addEventListener('DOMContentLoaded', () => {
  populateFilterCategories();
  initAddTransactionForm();
  initEditModal();
  initDeleteModal();
  initFilters();

  // Initial data load
  refreshAll();
});
