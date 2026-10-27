// Logic for Low Balance Alert & Financial Advice Page

async function loadAlertsPage() {
  const thresholdInput = document.getElementById('thresholdInput');
  const currentThreshold = getLowBalanceThreshold();

  if (thresholdInput) {
    thresholdInput.value = currentThreshold;
  }

  try {
    // 1. Fetch current balance
    const summary = await api.getSummary();
    const balance = summary.balance || 0;
    const threshold = currentThreshold;

    const alertStatusBox = document.getElementById('alertStatusBox');
    const alertTitle = document.getElementById('alertTitle');
    const alertMessage = document.getElementById('alertMessage');
    const alertAdviceList = document.getElementById('alertAdviceList');
    const currentBalanceDisplay = document.getElementById('currentBalanceDisplay');
    const thresholdDisplay = document.getElementById('thresholdDisplay');
    const statusDifferenceDisplay = document.getElementById('statusDifferenceDisplay');

    if (currentBalanceDisplay) currentBalanceDisplay.textContent = formatCurrency(balance);
    if (thresholdDisplay) thresholdDisplay.textContent = formatCurrency(threshold);

    if (balance < threshold) {
      // LOW BALANCE WARNING
      if (alertStatusBox) {
        alertStatusBox.className = 'alert-status-card status-danger';
      }
      if (alertTitle) {
        alertTitle.innerHTML = '🚨 Warning: Your Balance is Low!';
      }
      if (alertMessage) {
        const deficit = threshold - balance;
        alertMessage.innerHTML = `Your current balance is <strong>${formatCurrency(balance)}</strong>, which is <strong>${formatCurrency(deficit)} below</strong> your safety threshold of <strong>${formatCurrency(threshold)}</strong>.<br><br>⚠️ <strong>Important:</strong> You are at risk of running out of funds. Please use your money carefully and avoid non-essential expenses!`;
      }
      if (statusDifferenceDisplay) {
        statusDifferenceDisplay.innerHTML = `<span class="text-danger">Deficit: -${formatCurrency(threshold - balance)}</span>`;
      }

      if (alertAdviceList) {
        alertAdviceList.innerHTML = `
          <li>🛑 <strong>Freeze Discretionary Spending:</strong> Avoid non-essential shopping, entertainment, and expensive dine-outs until your next income.</li>
          <li>🛒 <strong>Focus on Essentials:</strong> Only spend on immediate necessities like daily food, travel/commute, and critical bills.</li>
          <li>🔍 <strong>Review Recent Expenses:</strong> Check your top spending categories below to find where money can be immediately saved.</li>
          <li>📅 <strong>Plan Next Income:</strong> Make sure you know when your next stipend, salary, or allowance arrives before making any purchases.</li>
        `;
      }
    } else {
      // HEALTHY BALANCE
      if (alertStatusBox) {
        alertStatusBox.className = 'alert-status-card status-safe';
      }
      if (alertTitle) {
        alertTitle.innerHTML = '✅ Balance Status: Healthy';
      }
      if (alertMessage) {
        const surplus = balance - threshold;
        alertMessage.innerHTML = `Your balance is <strong>${formatCurrency(balance)}</strong>, which is <strong>${formatCurrency(surplus)} safely above</strong> your safety limit of <strong>${formatCurrency(threshold)}</strong>.`;
      }
      if (statusDifferenceDisplay) {
        statusDifferenceDisplay.innerHTML = `<span class="text-income">Surplus: +${formatCurrency(balance - threshold)}</span>`;
      }

      if (alertAdviceList) {
        alertAdviceList.innerHTML = `
          <li>👍 <strong>Great Job:</strong> Your finances are currently in a secure position.</li>
          <li>🎯 <strong>Maintain the Cushion:</strong> Keep tracking all daily expenses so your balance doesn't unexpectedly drop.</li>
          <li>💡 <strong>Set Aside Savings:</strong> Consider allocating any extra surplus into a savings fund.</li>
        `;
      }
    }

    // 2. Load Top Expense Categories
    const categories = await api.getCategoryBreakdown();
    const topCategoriesList = document.getElementById('topCategoriesList');
    if (topCategoriesList) {
      topCategoriesList.innerHTML = '';
      if (!categories || categories.length === 0) {
        topCategoriesList.innerHTML = '<li class="text-muted">No expense categories recorded yet.</li>';
      } else {
        categories.slice(0, 4).forEach((cat, idx) => {
          const li = document.createElement('li');
          li.className = 'insight-item';
          li.innerHTML = `
            <div>
              <strong>#${idx + 1} ${cat.category}</strong>
              <div class="text-muted text-sm">${cat.count} transaction(s)</div>
            </div>
            <div class="text-expense font-bold">${formatCurrency(cat.total)}</div>
          `;
          topCategoriesList.appendChild(li);
        });
      }
    }

    // 3. Load Largest Recent Expenses
    const allExpenses = await api.getTransactions({ type: 'expense' });
    const largestList = document.getElementById('largestExpensesList');
    if (largestList) {
      largestList.innerHTML = '';
      if (!allExpenses || allExpenses.length === 0) {
        largestList.innerHTML = '<li class="text-muted">No expenses recorded yet.</li>';
      } else {
        // Sort descending by amount
        const sorted = [...allExpenses].sort((a, b) => b.amount - a.amount).slice(0, 4);
        sorted.forEach(item => {
          const li = document.createElement('li');
          li.className = 'insight-item';
          li.innerHTML = `
            <div>
              <strong>${item.category}</strong>: ${item.note || 'No note'}
              <div class="text-muted text-sm">${formatDate(item.date)}</div>
            </div>
            <div class="text-expense font-bold">- ${formatCurrency(item.amount)}</div>
          `;
          largestList.appendChild(li);
        });
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
      showToast(`Threshold updated to ${formatCurrency(val)}`, 'success');
      loadAlertsPage();
      updateNavAlertBadge();
    });
  }

  loadAlertsPage();
});
