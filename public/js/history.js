// Logic for Transaction History Page (Filters, Table, Edit Modal, Delete Modal)

const EXPENSE_CATEGORIES = [
  'Food', 'Travel', 'Rent', 'Bills', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'
];

const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Gift', 'Other'
];

let deleteCandidateId = null;

// Populate category dropdown
function populateCategorySelect(selectElement, type, selectedCategory = '') {
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

// Populate filter dropdown with all categories
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

// Read current active filters
function getActiveFilters() {
  const type = document.getElementById('filterType')?.value || 'all';
  const category = document.getElementById('filterCategory')?.value || 'all';
  const startDate = document.getElementById('filterStartDate')?.value || '';
  const endDate = document.getElementById('filterEndDate')?.value || '';
  const search = document.getElementById('filterSearch')?.value || '';

  return { type, category, startDate, endDate, search };
}

// Render transactions table
function renderTable(transactions) {
  const tbody = document.getElementById('transactionsTableBody');
  const emptyState = document.getElementById('transactionsEmpty');
  const table = document.getElementById('transactionsTable');
  const countEl = document.getElementById('filteredCount');

  if (!tbody) return;
  tbody.innerHTML = '';

  if (countEl) countEl.textContent = `${transactions.length} record(s)`;

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

    tr.innerHTML = `
      <td>${formatDate(t.date)}</td>
      <td>
        <span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">
          ${t.type.toUpperCase()}
        </span>
      </td>
      <td><span class="category-pill">${t.category}</span></td>
      <td class="cell-note" title="${t.note || ''}">${t.note || '<span class="text-muted">—</span>'}</td>
      <td class="cell-amount ${isIncome ? 'text-income' : 'text-expense'}">
        ${isIncome ? '+' : '-'} ${formatCurrency(t.amount)}
      </td>
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

// Reload table with current filters
async function loadTransactions() {
  const filters = getActiveFilters();
  try {
    const transactions = await api.getTransactions(filters);
    renderTable(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    showToast(err.message || 'Error loading transactions', 'error');
  }
}

// Edit Modal functions
async function openEditModal(id) {
  try {
    const transaction = await api.getTransaction(id);

    document.getElementById('editId').value = transaction._id;
    document.getElementById('editAmount').value = transaction.amount;
    document.getElementById('editNote').value = transaction.note || '';

    const d = new Date(transaction.date);
    document.getElementById('editDate').value = d.toISOString().split('T')[0];

    const typeRadios = document.querySelectorAll('input[name="editType"]');
    typeRadios.forEach(r => {
      if (r.value === transaction.type) r.checked = true;
    });

    const catSelect = document.getElementById('editCategory');
    populateCategorySelect(catSelect, transaction.type, transaction.category);

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

function initEditModal() {
  const modal = document.getElementById('editModal');
  const form = document.getElementById('editTransactionForm');
  const closeBtn = document.getElementById('closeEditModal');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const typeRadios = form ? form.querySelectorAll('input[name="editType"]') : [];
  const categorySelect = document.getElementById('editCategory');

  if (closeBtn) closeBtn.addEventListener('click', closeEditModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeEditModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeEditModal();
    });
  }

  typeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      populateCategorySelect(categorySelect, e.target.value);
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
        loadTransactions();
        updateNavAlertBadge();
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
        loadTransactions();
        updateNavAlertBadge();
      } catch (err) {
        closeDeleteModal();
        showToast(err.message || 'Failed to delete transaction', 'error');
      }
    });
  }
}

// Filters initialization
function initFilters() {
  const filterType = document.getElementById('filterType');
  const filterCategory = document.getElementById('filterCategory');
  const filterStartDate = document.getElementById('filterStartDate');
  const filterEndDate = document.getElementById('filterEndDate');
  const filterSearch = document.getElementById('filterSearch');
  const resetBtn = document.getElementById('resetFiltersBtn');

  [filterType, filterCategory, filterStartDate, filterEndDate].forEach(el => {
    if (el) el.addEventListener('change', loadTransactions);
  });

  let searchTimeout = null;
  if (filterSearch) {
    filterSearch.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(loadTransactions, 300);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (filterType) filterType.value = 'all';
      if (filterCategory) filterCategory.value = 'all';
      if (filterStartDate) filterStartDate.value = '';
      if (filterEndDate) filterEndDate.value = '';
      if (filterSearch) filterSearch.value = '';
      loadTransactions();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  populateFilterCategories();
  initEditModal();
  initDeleteModal();
  initFilters();
  loadTransactions();
});
