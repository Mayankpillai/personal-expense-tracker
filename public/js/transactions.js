// Transaction management logic (CRUD, Modals, Forms)

const EXPENSE_CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Gift', 'Other'
];

let deleteCandidateId = null;

// Populate category dropdown based on transaction type (income/expense)
function populateCategoryDropdown(selectElement, type, selectedCategory = '') {
  if (!selectElement) return;

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  selectElement.innerHTML = '<option value="">-- Select Category --</option>';

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (selectedCategory && selectedCategory.toLowerCase() === cat.toLowerCase()) {
      opt.selected = true;
    }
    selectElement.appendChild(opt);
  });
}

// Populate filter category dropdown with all categories
function populateFilterCategories() {
  const filterSelect = document.getElementById('filterCategory');
  if (!filterSelect) return;

  const allCategories = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])).sort();
  filterSelect.innerHTML = '<option value="all">All Categories</option>';

  allCategories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    filterSelect.appendChild(opt);
  });
}

// Format date to readable string (e.g., "24 Oct 2026")
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Format number to Indian Currency format
function formatCurrency(amount) {
  return '₹' + Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Render transactions table
function renderTransactionsTable(transactions) {
  const tbody = document.getElementById('transactionsTableBody');
  const emptyState = document.getElementById('transactionsEmpty');
  const table = document.getElementById('transactionsTable');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (!transactions || transactions.length === 0) {
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  transactions.forEach(t => {
    const tr = document.createElement('tr');

    const isIncome = t.type === 'income';
    const amountClass = isIncome ? 'text-income' : 'text-expense';
    const amountPrefix = isIncome ? '+ ' : '- ';

    // Format date for display
    const formattedDate = formatDate(t.date);

    tr.innerHTML = `
      <td>${formattedDate}</td>
      <td>
        <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">
          ${t.type.toUpperCase()}
        </span>
      </td>
      <td>
        <span class="category-pill">${t.category}</span>
      </td>
      <td class="cell-note" title="${t.note || ''}">${t.note || '<span class="text-muted">—</span>'}</td>
      <td class="cell-amount ${amountClass}">${amountPrefix}${formatCurrency(t.amount)}</td>
      <td class="cell-actions">
        <button class="btn-action btn-edit" onclick="openEditModal('${t._id}')" title="Edit">
          ✏️ Edit
        </button>
        <button class="btn-action btn-delete" onclick="promptDelete('${t._id}')" title="Delete">
          🗑️ Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Initialize Add Transaction Form
function initAddTransactionForm() {
  const form = document.getElementById('addTransactionForm');
  const typeRadios = form ? form.querySelectorAll('input[name="type"]') : [];
  const categorySelect = document.getElementById('addCategory');
  const dateInput = document.getElementById('addDate');

  // Set today's date as default
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }

  // Populate initial categories (default is expense)
  populateCategoryDropdown(categorySelect, 'expense');

  // Switch categories when type changes
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      populateCategoryDropdown(categorySelect, e.target.value);
    });
  });

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
        showToast('Please select a date', 'error');
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

        // Reset form inputs except date
        document.getElementById('addAmount').value = '';
        document.getElementById('addNote').value = '';
        categorySelect.value = '';

        // Reload all data
        refreshAll();
      } catch (err) {
        showToast(err.message || 'Failed to add transaction', 'error');
      }
    });
  }
}

// Edit Modal functions
async function openEditModal(id) {
  try {
    const transaction = await api.getTransaction(id);

    document.getElementById('editId').value = transaction._id;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editNote').value = transaction.note || '';

    // Format date string for HTML date input (YYYY-MM-DD)
    const d = new Date(transaction.date);
    const dateStr = d.toISOString().split('T')[0];
    document.getElementById('editDate').value = dateStr;

    // Set type radio
    const typeRadios = document.querySelectorAll('input[name="editType"]');
    typeRadios.forEach(r => {
      if (r.value === transaction.type) r.checked = true;
    });

    // Populate category dropdown and select existing category
    const catSelect = document.getElementById('editCategory');
    populateCategoryDropdown(catSelect, transaction.type, transaction.category);

    // Show modal
    const modal = document.getElementById('editModal');
    if (modal) modal.classList.add('active');
  } catch (err) {
    showToast(err.message || 'Failed to load transaction', 'error');
  }
}

function closeEditModal() {
  const modal = document.getElementById('editModal');
  if (modal) modal.classList.remove('active');
}

// Initialize Edit Modal Events
function initEditModal() {
  const modal = document.getElementById('editModal');
  const form = document.getElementById('editTransactionForm');
  const closeBtn = document.getElementById('closeEditModal');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const typeRadios = form ? form.querySelectorAll('input[name="editType"]') : [];
  const categorySelect = document.getElementById('editCategory');

  if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);

  // Close when clicking modal backdrop
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeEditModal();
    });
  }

  // Update categories when type is toggled in edit modal
  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      populateCategoryDropdown(categorySelect, e.target.value);
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = document.getElementById('editId').value;
      const type = form.querySelector('input[name="editType"]:checked').value;
      const amount = parseFloat(document.getElementById('editAmount').value);
      const category = categorySelect.value;
      const date = document.getElementById('editDate').value;
      const note = document.getElementById('editNote').value;

      if (!amount || isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount greater than 0', 'error');
        return;
      }

      if (!category) {
        showToast('Please select a category', 'error');
        return;
      }

      try {
        await api.updateTransaction(id, {
          type,
          amount,
          category,
          date,
          note
        });

        closeEditModal();
        showToast('Transaction updated successfully!', 'success');
        refreshAll();
      } catch (err) {
        showToast(err.message || 'Failed to update transaction', 'error');
      }
    });
  }
}

// Delete Confirmation Modal functions
function promptDelete(id) {
  deleteCandidateId = id;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.add('active');
}

function closeDeleteModal() {
  deleteCandidateId = null;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.remove('active');
}

function initDeleteModal() {
  const modal = document.getElementById('deleteModal');
  const cancelBtn = document.getElementById('cancelDeleteBtn');
  const confirmBtn = document.getElementById('confirmDeleteBtn');

  if (cancelBtn) cancelBtn.addEventListener('click', closeDeleteModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeDeleteModal();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (!deleteCandidateId) return;

      try {
        await api.deleteTransaction(deleteCandidateId);
        closeDeleteModal();
        showToast('Transaction deleted successfully', 'success');
        refreshAll();
      } catch (err) {
        closeDeleteModal();
        showToast(err.message || 'Failed to delete transaction', 'error');
      }
    });
  }
}
