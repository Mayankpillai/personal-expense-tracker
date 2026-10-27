// Chart.js visualizations for Expense Analytics

let categoryChartInstance = null;
let monthlyChartInstance = null;

// Palette for categories
const CHART_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#64748b'  // Slate
];

const charts = {
  // Render Doughnut Chart for Category Breakdown
  renderCategoryChart(categoriesData) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    if (categoryChartInstance) {
      categoryChartInstance.destroy();
    }

    const emptyNotice = document.getElementById('categoryChartEmpty');

    if (!categoriesData || categoriesData.length === 0) {
      if (emptyNotice) emptyNotice.style.display = 'flex';
      ctx.style.display = 'none';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    ctx.style.display = 'block';

    const labels = categoriesData.map(c => c.category);
    const dataValues = categoriesData.map(c => c.total);

    categoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: dataValues,
          backgroundColor: CHART_COLORS.slice(0, labels.length),
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { family: "'Inter', sans-serif", size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return ` ${label}: ₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        },
        cutout: '65%'
      }
    });
  },

  // Render Bar Chart for Monthly Income vs Expense Comparison
  renderMonthlyChart(monthlyData) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    if (monthlyChartInstance) {
      monthlyChartInstance.destroy();
    }

    const emptyNotice = document.getElementById('monthlyChartEmpty');

    if (!monthlyData || monthlyData.length === 0) {
      if (emptyNotice) emptyNotice.style.display = 'flex';
      ctx.style.display = 'none';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    ctx.style.display = 'block';

    const labels = monthlyData.map(d => d.label);
    const incomeValues = monthlyData.map(d => d.income);
    const expenseValues = monthlyData.map(d => d.expense);

    monthlyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income (₹)',
            data: incomeValues,
            backgroundColor: '#10b981',
            borderRadius: 6,
            maxBarThickness: 36
          },
          {
            label: 'Expense (₹)',
            data: expenseValues,
            backgroundColor: '#ef4444',
            borderRadius: 6,
            maxBarThickness: 36
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString('en-IN');
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 14,
              font: { family: "'Inter', sans-serif", size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const datasetLabel = context.dataset.label || '';
                const value = context.parsed.y || 0;
                return ` ${datasetLabel}: ₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    });
  }
};
