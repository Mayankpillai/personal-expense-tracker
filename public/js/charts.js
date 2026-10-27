// Chart.js visualizations for Expense Analytics

let categoryChartInstance = null;
let dailyChartInstance = null;

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

  // Render Day-wise Expense Bar Chart for Selected Month
  renderDailyExpenseChart(dailyData) {
    const ctx = document.getElementById('dailyExpenseChart');
    if (!ctx) return;

    if (dailyChartInstance) {
      dailyChartInstance.destroy();
    }

    const emptyNotice = document.getElementById('dailyChartEmpty');

    if (!dailyData || !dailyData.days || dailyData.days.length === 0 || dailyData.totalExpense === 0) {
      if (emptyNotice) {
        emptyNotice.style.display = 'flex';
        emptyNotice.innerHTML = `<p>No expenses recorded for ${dailyData ? dailyData.monthLabel : 'this month'}.</p>`;
      }
      ctx.style.display = 'none';
      return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    ctx.style.display = 'block';

    const labels = dailyData.days.map(d => `${d.day}`);
    const values = dailyData.days.map(d => d.amount);

    dailyChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Expense (₹)',
            data: values,
            backgroundColor: '#ef4444',
            hoverBackgroundColor: '#dc2626',
            borderRadius: 4,
            borderSkipped: false,
            maxBarThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: `Day of Month (${dailyData.monthLabel})`,
              font: { size: 11, family: "'Inter', sans-serif", weight: '500' },
              color: '#64748b'
            },
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
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(items) {
                const day = items[0].label;
                return `Day ${day} (${dailyData.monthLabel})`;
              },
              label: function(context) {
                const value = context.parsed.y || 0;
                return ` Daily Expense: ₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
              }
            }
          }
        }
      }
    });
  }
};
