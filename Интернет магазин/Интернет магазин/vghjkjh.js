// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    displayStats();
    displayNews();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '#login') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.background = '';
            if (link.getAttribute('href') === `#${current}`) {
                link.style.background = 'rgba(255, 255, 255, 0.2)';
            }
        });
    });
});

// Отображение статистики
function displayStats() {
    document.querySelector('[data-stat="students"]').textContent = schoolStats.students;
    document.querySelector('[data-stat="teachers"]').textContent = schoolStats.teachers;
    document.querySelector('[data-stat="classrooms"]').textContent = schoolStats.classrooms;
    document.querySelector('[data-stat="clubs"]').textContent = schoolStats.clubs;
}

// Отображение новостей
function displayNews() {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '';
    
    newsData.forEach((news, index) => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.style.animationDelay = `${index * 0.1}s`;
        
        newsCard.innerHTML = `
            <div class="news-image">${news.icon}</div>
            <div class="news-content">
                <div class="news-date">${news.date}</div>
                <h3>${news.title}</h3>
                <p>${news.description}</p>
                <a href="${news.link}" class="read-more">Толук окуу →</a>
            </div>
        `;
        
        newsGrid.appendChild(newsCard);
    });
}

// Открытие модального окна входа
function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('errorMessage').classList.remove('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// Закрытие модального окна
function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
}

// Обработка входа
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Проверка учетных данных
    let isAuthenticated = false;
    let userRole = '';
    
    for (let key in ADMIN_CREDENTIALS) {
        if (ADMIN_CREDENTIALS[key].username === username && 
            ADMIN_CREDENTIALS[key].password === password) {
            isAuthenticated = true;
            userRole = ADMIN_CREDENTIALS[key].role;
            break;
        }
    }
    
    if (isAuthenticated) {
        // Сохраняем сессию
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userRole', userRole);
        sessionStorage.setItem('username', username);
        
        // Закрываем модальное окно
        closeLoginModal();
        
        // Перенаправляем на админ-панель
        window.location.href = 'admin.html';
    } else {
        errorMessage.classList.add('active');
    }
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('loginModal');
    if (event.target === modal) {
        closeLoginModal();
    }
}

// Закрытие модального окна по клавише ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLoginModal();
    }
});