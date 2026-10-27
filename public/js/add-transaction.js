// Logic for Add Transaction Page

const EXPENSE_CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Gift', 'Other'
];

function populateCategoryDropdown(selectElement, type) {
  if (!selectElement) return;

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  selectElement.innerHTML = '<option value="">-- Select Category --</option>';

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    selectElement.appendChild(opt);
  });
}

// Load recently added transactions to display below the form
async function loadRecentAdded() {
  const tbody = document.getElementById('recentAddedTableBody');
  const table = document.getElementById('recentAddedTable');
  const empty = document.getElementById('recentAddedEmpty');

  if (!tbody) return;

  try {
    const transactions = await api.getTransactions();
    const recent = transactions.slice(0, 4);

    tbody.innerHTML = '';
    if (recent.length === 0) {
      if (table) table.style.display = 'none';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (table) table.style.display = 'table';
    if (empty) empty.style.display = 'none';

    recent.forEach(t => {
      const isIncome = t.type === 'income';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${formatDate(t.date)}</td>
        <td><span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${t.type.toUpperCase()}</span></td>
        <td><span class="category-pill">${t.category}</span></td>
        <td>${t.note || '<span class="text-muted">—</span>'}</td>
        <td class="cell-amount ${isIncome ? 'text-income' : 'text-expense'}">
          ${isIncome ? '+' : '-'} ${formatCurrency(t.amount)}
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading recent transactions:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('addTransactionForm');
  const categorySelect = document.getElementById('addCategory');
  const dateInput = document.getElementById('addDate');
  const typeRadios = form ? form.querySelectorAll('input[name="type"]') : [];

  // Set today's date
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Populate default categories (expense)
  populateCategoryDropdown(categorySelect, 'expense');

  // Change categories when type radio toggles
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      populateCategoryDropdown(categorySelect, e.target.value);
    });
  });

  // Handle form submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const type = form.querySelector('input[name="type"]:checked').value;
      const amount = parseFloat(document.getElementById('addAmount').value);
      const category = categorySelect.value;
      const date = dateInput.value;
      const note = document.getElementById('addNote').value;

      if (!amount || isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount greater than 0', 'error');
        return;
      }

      if (!category) {
        showToast('Please select a category', 'error');
        return;
      }

      if (!date) {
        showToast('Please select a valid date', 'error');
        return;
      }

      try {
        await api.createTransaction({
          type,
          amount,
          category,
          date,
          note
        });

        showToast('Transaction added successfully!', 'success');

        // Reset inputs
        document.getElementById('addAmount').value = '';
        document.getElementById('addNote').value = '';
        categorySelect.value = '';

        // Refresh navbar alert badge and recent list
        updateNavAlertBadge();
        loadRecentAdded();
      } catch (err) {
        showToast(err.message || 'Failed to add transaction', 'error');
      }
    });
  }

  loadRecentAdded();
});
