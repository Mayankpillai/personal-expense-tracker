// Logic for Low Balance Alert Page & Largest Expense in This Month

async function loadAlertsPage() {
  const thresholdInput = document.getElementById('thresholdInput');
  const currentThreshold = getLowBalanceThreshold();

  if (thresholdInput) {
    thresholdInput.value = currentThreshold;
  }

  const alertBox = document.getElementById('alertBox');
  const monthLabel = document.getElementById('currentMonthLabel');
  const largestContainer = document.getElementById('largestMonthExpenseContainer');

  const now = new Date();
  const monthName = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  if (monthLabel) monthLabel.textContent = monthName;

  try {
    // 1. Fetch Summary to check Balance
    const summary = await api.getSummary();
    const balance = summary.balance || 0;
    const threshold = currentThreshold;

    if (alertBox) {
      if (balance < threshold) {
        // LOW BALANCE ALERT
        alertBox.innerHTML = `
          <div class="alert-status-card status-danger">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="font-size: 32px;">🚨</span>
              <div>
                <h3 style="color: #b91c1c; font-size: 20px; font-weight: 700;">Warning: Low Balance Alert!</h3>
                <p style="font-size: 14px; color: #7f1d1d; margin-top: 3px;">
                  Your current balance is <strong>${formatCurrency(balance)}</strong>, which is below your set limit of <strong>${formatCurrency(threshold)}</strong>.
                </p>
              </div>
            </div>
            <div class="alert-warning-callout">
              <p>
                ⚠️ <strong>Alert:</strong> Your balance is low, so you should use money accordingly and avoid unnecessary expenses.
              </p>
            </div>
          </div>
        `;
      } else {
        // BALANCE IS SUFFICIENT (Clean, simple status without unnecessary advice cards)
        alertBox.innerHTML = `
          <div class="alert-status-card status-safe" style="padding: 18px 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 28px;">✅</span>
                <div>
                  <h3 style="color: #047857; font-size: 18px; font-weight: 600;">Balance is Sufficient</h3>
                  <p style="font-size: 14px; color: #065f46; margin-top: 2px;">
                    Current Balance: <strong>${formatCurrency(balance)}</strong> &bull; Minimum Limit: <strong>${formatCurrency(threshold)}</strong>
                  </p>
                </div>
              </div>
              <span class="badge badge-income" style="padding: 6px 12px; font-size: 12px;">Normal Status</span>
            </div>
          </div>
        `;
      }
    }

    // 2. Fetch Largest Expense in This Month
    const allExpenses = await api.getTransactions({ type: 'expense' });

    // Filter to current month & year
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const thisMonthExpenses = allExpenses.filter(t => {
      const d = new Date(t.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    if (largestContainer) {
      if (thisMonthExpenses.length === 0) {
        largestContainer.innerHTML = `
          <div class="empty-state" style="padding: 24px;">
            <div class="empty-icon" style="font-size: 30px;">🧾</div>
            <p class="text-muted">No expenses recorded for ${monthName} yet.</p>
          </div>
        `;
      } else {
        // Sort descending by amount
        thisMonthExpenses.sort((a, b) => b.amount - a.amount);
        const largest = thisMonthExpenses[0];
        const otherExpenses = thisMonthExpenses.slice(1, 4);

        let othersHtml = '';
        if (otherExpenses.length > 0) {
          othersHtml = `
            <div style="margin-top: 20px; border-top: 1px solid var(--border-color); padding-top: 16px;">
              <h5 style="font-size: 13px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px;">
                Other Expenses This Month:
              </h5>
              <div class="insights-list">
                ${otherExpenses.map(item => `
                  <div class="insight-item">
                    <div>
                      <strong>${item.category}</strong>: ${item.note || 'No description'}
                      <div class="text-muted text-sm">${formatDate(item.date)}</div>
                    </div>
                    <div class="text-expense font-bold">- ${formatCurrency(item.amount)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }

        largestContainer.innerHTML = `
          <div class="largest-expense-hero">
            <div class="hero-details">
              <div class="hero-top-row">
                <span class="category-pill">${largest.category}</span>
                <span class="badge badge-expense">Highest Expense in ${monthName}</span>
              </div>
              <h4 class="hero-note">${largest.note || 'No description'}</h4>
              <div class="hero-date">📅 Date: <strong>${formatDate(largest.date)}</strong></div>
            </div>
            <div class="hero-amount-block">
              <div class="hero-label">Amount Spent</div>
              <div class="hero-amount">- ${formatCurrency(largest.amount)}</div>
            </div>
          </div>
          ${othersHtml}
        `;
      }
    }
  } catch (err) {
    console.error('Error loading alerts page:', err);
    showToast(err.message || 'Error loading alert data', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const saveThresholdBtn = document.getElementById('saveThresholdBtn');
  const thresholdInput = document.getElementById('thresholdInput');

  if (saveThresholdBtn && thresholdInput) {
    saveThresholdBtn.addEventListener('click', () => {
      const val = parseFloat(thresholdInput.value);
      if (isNaN(val) || val < 0) {
        showToast('Please enter a valid positive threshold amount', 'error');
        return;
      }
      setLowBalanceThreshold(val);
      showToast(`Minimum limit updated to ${formatCurrency(val)}`, 'success');
      loadAlertsPage();
      updateNavAlertBadge();
    });
  }

  loadAlertsPage();
});
