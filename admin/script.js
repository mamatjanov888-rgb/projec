// Хранилище пользователей
let users = [];
let nextId = 1;
let editUserId = null;

// Графики
let trafficChart, sourceChart, registrationChart;

// Функция для сохранения пользователей в localStorage
function saveUsersToStorage() {
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Функция загрузки пользователей из localStorage
function loadUsersFromStorage() {
    const stored = localStorage.getItem('registeredUsers');
    if(stored) {
        users = JSON.parse(stored);
        if(users.length > 0) {
            nextId = Math.max(...users.map(u => u.id)) + 1;
        }
    } else {
        // Добавляем тестовых пользователей
        users = [
            { id: nextId++, name: "Алексей Иванов", email: "alex@example.com", phone: "+7 (999) 123-45-67", role: "Администратор", status: "active", registeredAt: new Date().toISOString() },
            { id: nextId++, name: "Мария Петрова", email: "maria@example.com", phone: "+7 (999) 234-56-78", role: "Менеджер", status: "active", registeredAt: new Date().toISOString() },
            { id: nextId++, name: "Дмитрий Соколов", email: "dima@example.com", phone: "", role: "Пользователь", status: "inactive", registeredAt: new Date(Date.now() - 86400000).toISOString() }
        ];
        saveUsersToStorage();
    }
}

// Функция регистрации нового пользователя
function registerUser(name, email, password, confirmPassword, role, phone) {
    // Валидация
    if(!name || !email || !password) {
        showAlert('Пожалуйста, заполните все обязательные поля', 'error');
        return false;
    }
    
    if(password !== confirmPassword) {
        showAlert('Пароли не совпадают!', 'error');
        return false;
    }
    
    if(password.length < 6) {
        showAlert('Пароль должен содержать минимум 6 символов', 'error');
        return false;
    }
    
    // Проверка на существующий email
    if(users.some(user => user.email === email)) {
        showAlert('Пользователь с таким email уже существует!', 'error');
        return false;
    }
    
    // Создаем нового пользователя
    const newUser = {
        id: nextId++,
        name: name,
        email: email,
        phone: phone || '',
        role: role,
        status: 'active',
        registeredAt: new Date().toISOString(),
        password: password // В реальном приложении пароль нужно хешировать!
    };
    
    users.push(newUser);
    saveUsersToStorage();
    
    showAlert(`Пользователь ${name} успешно зарегистрирован!`, 'success');
    
    // Очищаем форму
    document.getElementById('registrationForm').reset();
    
    // Обновляем все интерфейсы
    updateAllInterfaces();
    
    return true;
}

function showAlert(message, type) {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.className = `alert alert-${type}`;
    alertDiv.style.display = 'block';
    
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 3000);
}

// Обновление всех интерфейсов
function updateAllInterfaces() {
    renderUsersTable();
    updateStats();
    updateRegistrationStats();
    updateDashboardStats();
    updateRegistrationChart();
}

// Обновление статистики в разделе регистрации
function updateRegistrationStats() {
    const totalUsersSpan = document.getElementById('totalUsers');
    const todayRegistrationsSpan = document.getElementById('todayRegistrations');
    const activeUsersSpan = document.getElementById('activeUsers');
    
    const today = new Date().toDateString();
    const todayRegistrations = users.filter(user => new Date(user.registeredAt).toDateString() === today).length;
    const activeUsers = users.filter(user => user.status === 'active').length;
    
    if(totalUsersSpan) totalUsersSpan.textContent = users.length;
    if(todayRegistrationsSpan) todayRegistrationsSpan.textContent = todayRegistrations;
    if(activeUsersSpan) activeUsersSpan.textContent = activeUsers;
}

// Обновление статистики в дашборде
function updateDashboardStats() {
    const dashboardTotalUsers = document.getElementById('dashboardTotalUsers');
    if(dashboardTotalUsers) dashboardTotalUsers.textContent = users.length;
    
    const activeSessionsSpan = document.getElementById('activeSessions');
    if(activeSessionsSpan) activeSessionsSpan.textContent = Math.floor(Math.random() * 200) + 80;
    
    const newOrdersSpan = document.getElementById('newOrders');
    if(newOrdersSpan) newOrdersSpan.textContent = '+' + (Math.floor(Math.random() * 45) + 28);
}

function updateStats() {
    updateRegistrationStats();
    updateDashboardStats();
}

// Рендер таблицы пользователей
function renderUsersTable() {
    const userTableBody = document.getElementById('userTableBody');
    if(!userTableBody) return;
    
    let html = '';
    users.forEach(user => {
        const statusClass = user.status === 'active' ? 'status-active' : 'status-inactive';
        const statusText = user.status === 'active' ? 'Активен' : 'Неактивен';
        const registeredDate = new Date(user.registeredAt).toLocaleDateString('ru-RU');
        
        html += `
            <tr>
                <td>${user.id}</td>
                <td><strong>${escapeHtml(user.name)}</strong></td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.phone) || '—'}</td>
                <td>${user.role}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${registeredDate}</td>
                <td class="action-icons">
                    <i class="fas fa-edit" onclick="editUser(${user.id})"></i>
                    <i class="fas fa-trash-alt" onclick="deleteUser(${user.id})" style="color: var(--danger);"></i>
                </td>
            </tr>
        `;
    });
    userTableBody.innerHTML = html;
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if(m === '&') return '&amp;';
        if(m === '<') return '&lt;';
        if(m === '>') return '&gt;';
        return m;
    });
}

// Редактирование пользователя
window.editUser = function(id) {
    const user = users.find(u => u.id === id);
    if(user) {
        editUserId = id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPhone').value = user.phone || '';
        document.getElementById('userRole').value = user.role;
        document.getElementById('userStatus').value = user.status;
        document.getElementById('modalTitle').innerText = 'Редактировать пользователя';
        document.getElementById('userModal').style.display = 'flex';
    }
};

// Удаление пользователя
window.deleteUser = function(id) {
    if(confirm('Вы уверены, что хотите удалить пользователя?')) {
        users = users.filter(u => u.id !== id);
        saveUsersToStorage();
        updateAllInterfaces();
    }
};

// Сохранение пользователя из модального окна
function saveUserFromModal() {
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;
    
    if(!name || !email) {
        alert('Заполните имя и email');
        return;
    }
    
    if(editUserId !== null) {
        const index = users.findIndex(u => u.id === editUserId);
        if(index !== -1) {
            users[index] = { ...users[index], name, email, phone, role, status };
        }
        editUserId = null;
    } else {
        const newId = nextId++;
        users.push({
            id: newId,
            name, email, phone, role, status,
            registeredAt: new Date().toISOString()
        });
    }
    saveUsersToStorage();
    updateAllInterfaces();
    closeModal();
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userPhone').value = '';
    editUserId = null;
}

// Обновление графика регистраций
function updateRegistrationChart() {
    const ctx = document.getElementById('registrationChart');
    if(!ctx) return;
    
    const last7Days = [];
    const registrationsCount = [];
    
    for(let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        last7Days.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
        const count = users.filter(user => new Date(user.registeredAt).toDateString() === dateStr).length;
        registrationsCount.push(count);
    }
    
    if(registrationChart) {
        registrationChart.destroy();
    }
    
    registrationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Новые регистрации',
                data: registrationsCount,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary') }
                }
            }
        }
    });
}

// Инициализация графиков дашборда
function initCharts() {
    const ctxTraffic = document.getElementById('trafficChart');
    if(ctxTraffic) {
        trafficChart = new Chart(ctxTraffic, {
            type: 'line',
            data: { 
                labels: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'], 
                datasets: [{ 
                    label: 'Посещения', 
                    data: [650, 720, 810, 780, 920, 1100, 980], 
                    borderColor: '#3b82f6', 
                    backgroundColor: 'rgba(59,130,246,0.1)', 
                    fill: true, 
                    tension: 0.3 
                }] 
            }
        });
    }
    
    const ctxSource = document.getElementById('sourceChart');
    if(ctxSource) {
        sourceChart = new Chart(ctxSource, {
            type: 'doughnut',
            data: { 
                labels: ['Прямой', 'Соцсети', 'Email', 'Рефералы'], 
                datasets: [{ 
                    data: [45, 28, 15, 12], 
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'] 
                }] 
            }
        });
    }
}

// Переключение вкладок
function setActiveTab(tabId) {
    const registrationTab = document.getElementById('registrationTab');
    const dashboardTab = document.getElementById('dashboardTab');
    const usersTab = document.getElementById('usersTab');
    const analyticsTab = document.getElementById('analyticsTab');
    const mainHeading = document.getElementById('mainHeading');
    const subHeading = document.getElementById('subHeading');
    const navLinks = document.querySelectorAll('.nav-link');
    
    registrationTab.style.display = 'none';
    dashboardTab.style.display = 'none';
    usersTab.style.display = 'none';
    analyticsTab.style.display = 'none';
    
    if(tabId === 'registration') {
        registrationTab.style.display = 'block';
        mainHeading.innerText = 'Регистрация пользователей';
        subHeading.innerText = 'Заполните форму для добавления нового пользователя в систему';
    } else if(tabId === 'dashboard') {
        dashboardTab.style.display = 'block';
        mainHeading.innerText = 'Панель управления';
        subHeading.innerText = 'Статистика и аналитика в реальном времени';
        updateDashboardStats();
    } else if(tabId === 'users') {
        usersTab.style.display = 'block';
        mainHeading.innerText = 'Управление пользователями';
        subHeading.innerText = 'Добавляйте, редактируйте или удаляйте учётные записи';
        renderUsersTable();
    } else if(tabId === 'analytics') {
        analyticsTab.style.display = 'block';
        mainHeading.innerText = 'Аналитика';
        subHeading.innerText = 'Расширенные метрики и отчёты';
        updateRegistrationChart();
    }
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('data-tab') === tabId) link.classList.add('active');
    });
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Регистрация формы
    const registrationForm = document.getElementById('registrationForm');
    if(registrationForm) {
        registrationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const role = document.getElementById('regRole').value;
            const phone = document.getElementById('regPhone').value;
            registerUser(name, email, password, confirmPassword, role, phone);
        });
    }
    
    // Навигация по вкладкам
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = link.getAttribute('data-tab');
            if(tab) setActiveTab(tab);
        });
    });
    
    // Темная тема
    const themeToggle = document.getElementById('themeToggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const icon = themeToggle.querySelector('i');
            if(document.body.classList.contains('dark')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }
    
    // Мобильное меню
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if(menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        
        document.addEventListener('click', (e) => {
            if(window.innerWidth <= 900 && !sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }
    
    // Модальное окно
    const addUserBtn = document.getElementById('addUserBtn');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if(addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            editUserId = null;
            document.getElementById('userName').value = '';
            document.getElementById('userEmail').value = '';
            document.getElementById('userPhone').value = '';
            document.getElementById('userRole').value = 'Пользователь';
            document.getElementById('userStatus').value = 'active';
            document.getElementById('modalTitle').innerText = 'Добавить пользователя';
            document.getElementById('userModal').style.display = 'flex';
        });
    }
    
    if(saveUserBtn) saveUserBtn.addEventListener('click', saveUserFromModal);
    if(closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    
    window.onclick = function(e) {
        const modal = document.getElementById('userModal');
        if(e.target === modal) closeModal();
    };
}

// Автообновление данных
function startAutoRefresh() {
    setInterval(() => {
        const dashboardTab = document.getElementById('dashboardTab');
        if(dashboardTab && dashboardTab.style.display !== 'none') {
            updateDashboardStats();
        }
        
        const registrationTab = document.getElementById('registrationTab');
        if(registrationTab && registrationTab.style.display !== 'none') {
            updateRegistrationStats();
        }
    }, 5000);
}

// Инициализация приложения
function init() {
    loadUsersFromStorage();
    initCharts();
    initEventListeners();
    updateAllInterfaces();
    setActiveTab('registration');
    startAutoRefresh();
}

// Запуск приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', init);