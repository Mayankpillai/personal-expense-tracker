// Dashboard page coordinator: summary cards, category chart, daily expenses bar chart, and low balance banner

// Update summary cards on dashboard
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

// Display Low Balance Warning Banner if balance is below threshold
function checkDashboardLowBalance(balance) {
  const threshold = getLowBalanceThreshold();
  const banner = document.getElementById('lowBalanceBanner');
  const bannerAmount = document.getElementById('bannerBalanceAmount');
  const bannerThreshold = document.getElementById('bannerThresholdAmount');

  if (!banner) return;

  if (balance < threshold) {
    banner.style.display = 'flex';
    if (bannerAmount) bannerAmount.textContent = formatCurrency(balance);
    if (bannerThreshold) bannerThreshold.textContent = formatCurrency(threshold);
  } else {
    banner.style.display = 'none';
  }
}

// Render recent 5 transactions
function renderRecentTransactions(transactions) {
  const tbody = document.getElementById('recentTableBody');
  const emptyState = document.getElementById('recentEmpty');
  const table = document.getElementById('recentTable');

  if (!tbody) return;
  tbody.innerHTML = '';

  const recent = transactions.slice(0, 5);

  if (recent.length === 0) {
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  recent.forEach(t => {
    const tr = document.createElement('tr');
    const isIncome = t.type === 'income';

    tr.innerHTML = `
      <td>${formatDate(t.date)}</td>
      <td>
        <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">
          ${t.type.toUpperCase()}
        </span>
      </td>
      <td><span class="category-pill">${t.category}</span></td>
      <td class="cell-note">${t.note || '<span class="text-muted">—</span>'}</td>
      <td class="cell-amount ${isIncome ? 'text-income' : 'text-expense'}">
        ${isIncome ? '+' : '-'} ${formatCurrency(t.amount)}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Load and render Day-wise Expense Bar Chart for selected month
let monthSelectInitialized = false;

async function loadDailyExpenseChart(selectedMonth) {
  try {
    const dailyData = await api.getDailyExpenses(selectedMonth);

    // Populate month selector dropdown if not already populated
    const select = document.getElementById('expenseMonthSelect');
    if (select && (!monthSelectInitialized || !selectedMonth)) {
      select.innerHTML = '';
      if (dailyData.availableMonths && dailyData.availableMonths.length > 0) {
        dailyData.availableMonths.forEach(m => {
          const opt = document.createElement('option');
          opt.value = m.period;
          opt.textContent = m.label;
          if (m.period === dailyData.selectedMonth) {
            opt.selected = true;
          }
          select.appendChild(opt);
        });
      }

      if (!monthSelectInitialized) {
        select.addEventListener('change', (e) => {
          loadDailyExpenseChart(e.target.value);
        });
        monthSelectInitialized = true;
      }
    }

    // Render bar chart
    charts.renderDailyExpenseChart(dailyData);
  } catch (err) {
    console.error('Error loading daily expenses chart:', err);
  }
}

// Load all dashboard components
async function loadDashboard() {
  try {
    // 1. Fetch Summary Totals (Total Money, Expenses, Balance)
    const summary = await api.getSummary();
    updateSummaryCards(summary);
    checkDashboardLowBalance(summary.balance || 0);

    // 2. Fetch Category Breakdown for Doughnut Chart
    const categories = await api.getCategoryBreakdown();
    charts.renderCategoryChart(categories);

    // 3. Fetch Day-wise Expenses for Bar Chart (defaults to current month)
    await loadDailyExpenseChart();

    // 4. Fetch Recent Transactions
    const transactions = await api.getTransactions();
    renderRecentTransactions(transactions);
  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast(error.message || 'Error fetching data from server', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadDashboard();
});
