// Common helper functions shared across all pages

const DEFAULT_LOW_BALANCE_THRESHOLD = 2000;

// Format amount to Indian Rupees (₹)
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Format date into readable string (e.g., "28 Oct 2026")
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Low balance threshold stored in localStorage
function getLowBalanceThreshold() {
  const saved = localStorage.getItem('low_balance_threshold');
  return saved ? parseFloat(saved) : DEFAULT_LOW_BALANCE_THRESHOLD;
}

function setLowBalanceThreshold(value) {
  localStorage.setItem('low_balance_threshold', value);
}

// Display toast notifications
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-fade-out');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}

// Check balance and update navigation alert badge across all pages
async function updateNavAlertBadge() {
  try {
    const summary = await api.getSummary();
    const balance = summary.balance || 0;
    const threshold = getLowBalanceThreshold();

    const badge = document.getElementById('navAlertBadge');
    if (badge) {
      if (balance < threshold) {
        badge.style.display = 'inline-block';
        badge.textContent = 'Low!';
      } else {
        badge.style.display = 'none';
      }
    }
    return { balance, threshold, isLow: balance < threshold };
  } catch (err) {
    console.error('Error checking balance alert:', err);
  }
}

// Initialize common navbar behavior
document.addEventListener('DOMContentLoaded', () => {
  updateNavAlertBadge();
});
