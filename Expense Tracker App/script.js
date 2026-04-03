// ============================================
// EXPENSE TRACKER APP - JAVASCRIPT
// ============================================

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
    expenses: [],
    filteredExpenses: [],
    darkMode: localStorage.getItem('darkMode') === 'true',
};

// ============================================
// DOM ELEMENTS
// ============================================

const elements = {
    // Form elements
    form: document.getElementById('expenseForm'),
    titleInput: document.getElementById('expenseTitle'),
    amountInput: document.getElementById('expenseAmount'),
    categorySelect: document.getElementById('expenseCategory'),
    dateInput: document.getElementById('expenseDate'),
    typeSelect: document.getElementById('expenseType'),

    // Summary elements
    totalIncomeEl: document.getElementById('totalIncome'),
    totalExpenseEl: document.getElementById('totalExpense'),
    totalBalanceEl: document.getElementById('totalBalance'),

    // List elements
    expensesList: document.getElementById('expensesList'),
    categoryFilter: document.getElementById('categoryFilter'),
    sortSelect: document.getElementById('sortSelect'),
    clearAllBtn: document.getElementById('clearAllBtn'),

    // Chart elements
    categoryChart: document.getElementById('categoryChart'),
    monthlyChart: document.getElementById('monthlyChart'),

    // Dark mode
    darkModeToggle: document.getElementById('darkModeToggle'),

    // Edit modal
    editModal: document.getElementById('editModal'),
    editForm: document.getElementById('editForm'),
    editIdInput: document.getElementById('editId'),
    editTitleInput: document.getElementById('editTitle'),
    editAmountInput: document.getElementById('editAmount'),
    editCategorySelect: document.getElementById('editCategory'),
    editDateInput: document.getElementById('editDate'),
    editTypeSelect: document.getElementById('editType'),
    closeModalBtn: document.querySelector('.close'),
};

// ============================================
// INITIALIZATION
// ============================================

function init() {
    loadExpenses();
    setDefaultDate();
    setupEventListeners();
    initDarkMode();
    renderExpenses();
    updateSummary();
    updateCharts();
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    elements.dateInput.value = today;
    elements.editDateInput.value = today;
}

function setupEventListeners() {
    elements.form.addEventListener('submit', handleAddExpense);
    elements.categoryFilter.addEventListener('change', handleFilter);
    elements.sortSelect.addEventListener('change', handleSort);
    elements.clearAllBtn.addEventListener('click', handleClearAll);
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    elements.editForm.addEventListener('submit', handleEditExpense);
    elements.closeModalBtn.addEventListener('click', closeEditModal);
    window.addEventListener('click', handleModalClick);
}

// ============================================
// LOCAL STORAGE
// ============================================

function loadExpenses() {
    const saved = localStorage.getItem('expenses');
    state.expenses = saved ? JSON.parse(saved) : [];
    state.filteredExpenses = [...state.expenses];
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
}

// ============================================
// EXPENSE OPERATIONS
// ============================================

function handleAddExpense(e) {
    e.preventDefault();

    const newExpense = {
        id: Date.now(),
        title: elements.titleInput.value.trim(),
        amount: parseFloat(elements.amountInput.value),
        category: elements.categorySelect.value,
        date: elements.dateInput.value,
        type: elements.typeSelect.value,
    };

    if (!newExpense.title || !newExpense.amount || newExpense.amount <= 0) {
        alert('Please fill all fields with valid values');
        return;
    }

    state.expenses.unshift(newExpense);
    saveExpenses();
    resetForm();
    renderExpenses();
    updateSummary();
    updateCharts();
}

function handleDeleteExpense(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        state.expenses = state.expenses.filter(expense => expense.id !== id);
        saveExpenses();
        renderExpenses();
        updateSummary();
        updateCharts();
    }
}

function handleEditExpense(e) {
    e.preventDefault();

    const id = parseInt(elements.editIdInput.value);
    const expenseIndex = state.expenses.findIndex(exp => exp.id === id);

    if (expenseIndex !== -1) {
        state.expenses[expenseIndex] = {
            id: id,
            title: elements.editTitleInput.value.trim(),
            amount: parseFloat(elements.editAmountInput.value),
            category: elements.editCategorySelect.value,
            date: elements.editDateInput.value,
            type: elements.editTypeSelect.value,
        };

        saveExpenses();
        closeEditModal();
        renderExpenses();
        updateSummary();
        updateCharts();
    }
}

function openEditModal(id) {
    const expense = state.expenses.find(exp => exp.id === id);

    if (expense) {
        elements.editIdInput.value = expense.id;
        elements.editTitleInput.value = expense.title;
        elements.editAmountInput.value = expense.amount;
        elements.editCategorySelect.value = expense.category;
        elements.editDateInput.value = expense.date;
        elements.editTypeSelect.value = expense.type;

        elements.editModal.style.display = 'block';
    }
}

function closeEditModal() {
    elements.editModal.style.display = 'none';
    elements.editForm.reset();
}

function handleModalClick(e) {
    if (e.target === elements.editModal) {
        closeEditModal();
    }
}

function handleClearAll() {
    if (confirm('This will delete ALL transactions. Are you sure?')) {
        state.expenses = [];
        state.filteredExpenses = [];
        saveExpenses();
        renderExpenses();
        updateSummary();
        updateCharts();
    }
}

function resetForm() {
    elements.form.reset();
    setDefaultDate();
    elements.titleInput.focus();
}

// ============================================
// RENDERING
// ============================================

function renderExpenses() {
    if (state.filteredExpenses.length === 0) {
        elements.expensesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No transactions found. Add one to get started!</p>
            </div>
        `;
        return;
    }

    elements.expensesList.innerHTML = state.filteredExpenses
        .map(expense => createExpenseElement(expense))
        .join('');

    // Add event listeners to delete and edit buttons
    document.querySelectorAll('.btn-danger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            handleDeleteExpense(id);
        });
    });

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            openEditModal(id);
        });
    });
}

function createExpenseElement(expense) {
    const amountSymbol = expense.type === 'Income' ? '+' : '-';
    const amountClass = expense.type === 'Income' ? 'income' : 'expense';

    return `
        <div class="expense-item ${amountClass}">
            <div class="expense-content">
                <div class="expense-title">${escapeHtml(expense.title)}</div>
                <div class="expense-category">${expense.category}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
            </div>
            <div class="expense-info">
                <div class="expense-amount">${amountSymbol}$${expense.amount.toFixed(2)}</div>
                <div class="expense-actions">
                    <button class="btn btn-edit" data-id="${expense.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" data-id="${expense.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// FILTERING & SORTING
// ============================================

function handleFilter() {
    handleSort();
}

function handleSort() {
    const category = elements.categoryFilter.value;
    const sortType = elements.sortSelect.value;

    // Filter by category
    state.filteredExpenses = state.expenses.filter(expense => {
        return category === '' || expense.category === category;
    });

    // Sort
    state.filteredExpenses.sort((a, b) => {
        switch (sortType) {
            case 'latest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            case 'highest':
                return b.amount - a.amount;
            case 'lowest':
                return a.amount - b.amount;
            default:
                return 0;
        }
    });

    renderExpenses();
}

// ============================================
// CALCULATIONS
// ============================================

function calculateTotals() {
    let income = 0;
    let expenses = 0;

    state.expenses.forEach(expense => {
        if (expense.type === 'Income') {
            income += expense.amount;
        } else {
            expenses += expense.amount;
        }
    });

    return {
        income,
        expenses,
        balance: income - expenses,
    };
}

function updateSummary() {
    const totals = calculateTotals();

    elements.totalIncomeEl.textContent = `$${totals.income.toFixed(2)}`;
    elements.totalExpenseEl.textContent = `$${totals.expenses.toFixed(2)}`;

    const balanceText = totals.balance >= 0 ? `$${totals.balance.toFixed(2)}` : `-$${Math.abs(totals.balance).toFixed(2)}`;
    elements.totalBalanceEl.textContent = balanceText;
    elements.totalBalanceEl.style.color = totals.balance >= 0 ? 'var(--income-color)' : 'var(--expense-color)';
}

// ============================================
// CHARTS
// ============================================

let categoryChartInstance = null;
let monthlyChartInstance = null;

function updateCharts() {
    updateCategoryChart();
    updateMonthlyChart();
}

function updateCategoryChart() {
    // Calculate spending by category (excluding income)
    const categoryData = {};

    state.expenses
        .filter(exp => exp.type === 'Expense')
        .forEach(expense => {
            categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
        });

    const labels = Object.keys(categoryData);
    const data = Object.values(categoryData);

    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
        '#f97316', '#eab308', '#84cc16', '#22c55e',
        '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    ];

    if (categoryChartInstance) {
        categoryChartInstance.destroy();
    }

    const ctx = elements.categoryChart.getContext('2d');
    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels.length > 0 ? labels : ['No Data'],
            datasets: [
                {
                    data: data.length > 0 ? data : [1],
                    backgroundColor: colors.slice(0, labels.length),
                    borderColor: '#ffffff',
                    borderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600',
                        },
                    },
                },
            },
        },
    });
}

function updateMonthlyChart() {
    // Calculate monthly income and expenses
    const monthlyData = {};

    state.expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { income: 0, expenses: 0 };
        }

        if (expense.type === 'Income') {
            monthlyData[monthKey].income += expense.amount;
        } else {
            monthlyData[monthKey].expenses += expense.amount;
        }
    });

    // Get last 6 months
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        months.push(monthKey);
    }

    const incomeData = months.map(month => monthlyData[month]?.income || 0);
    const expenseData = months.map(month => monthlyData[month]?.expenses || 0);
    const labels = months.map(month => formatMonthLabel(month));

    if (monthlyChartInstance) {
        monthlyChartInstance.destroy();
    }

    const ctx = elements.monthlyChart.getContext('2d');
    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#10b981',
                    borderRadius: 5,
                    borderSkipped: false,
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: '#ef4444',
                    borderRadius: 5,
                    borderSkipped: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '600',
                        },
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return '$' + value.toFixed(0);
                        },
                    },
                },
            },
        },
    });
}

// ============================================
// DARK MODE
// ============================================

function initDarkMode() {
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        updateDarkModeIcon();
    }
}

function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    localStorage.setItem('darkMode', state.darkMode);
    document.body.classList.toggle('dark-mode');
    updateDarkModeIcon();
}

function updateDarkModeIcon() {
    const icon = elements.darkModeToggle.querySelector('i');
    if (state.darkMode) {
        icon.removeClass = 'fas fa-moon';
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', options);
}

function formatMonthLabel(monthString) {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// START APP
// ============================================

document.addEventListener('DOMContentLoaded', init);
