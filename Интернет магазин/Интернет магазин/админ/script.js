        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
        }


        // Глобальные переменные
        let currentUser = null;
        let userAddresses = [];
        
        // Пароль администратора (можно изменить)
        const ADMIN_PASSWORD = "admin123";

        // Проверка авторизации при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            checkAuth();
            loadUserAddresses();

            // Навигация
            const navLinks = document.querySelectorAll('.nav-link');
            const sections = document.querySelectorAll('section');

            function setActiveLink() {
                let current = '';
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (scrollY >= (sectionTop - 200)) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('nav-active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('nav-active');
                    }
                });
            }

            window.addEventListener('scroll', setActiveLink);

            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    if (targetId === '#home') {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else {
                        const targetSection = document.querySelector(targetId);
                        if (targetSection) {
                            window.scrollTo({
                                top: targetSection.offsetTop - 100,
                                behavior: 'smooth'
                            });
                        }
                    }
                });
            });

            // Формы
            const loginForm = document.getElementById('loginForm');
            if (loginForm) loginForm.addEventListener('submit', (e) => { e.preventDefault(); login(); });

            const registerForm = document.getElementById('registerForm');
            if (registerForm) registerForm.addEventListener('submit', (e) => { e.preventDefault(); register(); });

            const profileForm = document.getElementById('profileForm');
            if (profileForm) profileForm.addEventListener('submit', (e) => { e.preventDefault(); saveProfile(); });

            const addressForm = document.getElementById('addressForm');
            if (addressForm) addressForm.addEventListener('submit', (e) => { e.preventDefault(); saveAddress(); });

            // Форма пароля администратора
            const adminPasswordForm = document.getElementById('adminPasswordForm');
            if (adminPasswordForm) {
                adminPasswordForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    checkAdminPassword();
                });
            }
        });

        // Показать модальное окно для ввода пароля администратора
        function showAdminPasswordModal() {
            // Очищаем поле ввода
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPasswordError').style.display = 'none';
            // Показываем модальное окно
            closeAllModals();
            document.getElementById('adminPasswordModal').style.display = 'flex';
        }

        // Проверка пароля администратора
        function checkAdminPassword() {
            const password = document.getElementById('adminPassword').value;
            const errorElement = document.getElementById('adminPasswordError');
            
            if (!password) {
                errorElement.textContent = 'Введите пароль';
                errorElement.style.display = 'block';
                return;
            }
            
            if (password === ADMIN_PASSWORD) {
                // Пароль правильный - переходим в админ-панель
                closeModal('adminPasswordModal');
                window.location.href = '/admin/index.html';
            } else {
                errorElement.textContent = 'Неверный пароль администратора';
                errorElement.style.display = 'block';
                // Очищаем поле
                document.getElementById('adminPassword').value = '';
                document.getElementById('adminPassword').focus();
            }
        }

        // Проверка авторизации
        function checkAuth() {
            const userData = localStorage.getItem('myshop_user');
            if (userData) {
                currentUser = JSON.parse(userData);
                updateUI();
            }
        }

        // Загрузка адресов
        function loadUserAddresses() {
            const addresses = localStorage.getItem('myshop_addresses_' + (currentUser ? currentUser.id : ''));
            if (addresses) {
                userAddresses = JSON.parse(addresses);
            }
        }

        // Обновление UI
        function updateUI() {
            const loginBtn = document.getElementById('loginBtn');
            const userMenu = document.getElementById('userMenu');
            const userAvatar = document.getElementById('userAvatar');
            const profilePage = document.getElementById('profilePage');

            if (currentUser) {
                if (loginBtn) loginBtn.style.display = 'none';
                if (userMenu) userMenu.style.display = 'flex';
                if (userAvatar) {
                    const initials = getInitials(currentUser.name, currentUser.lastName);
                    userAvatar.textContent = initials;
                }
                if (profilePage) profilePage.style.display = 'none';
            } else {
                if (loginBtn) loginBtn.style.display = 'block';
                if (userMenu) userMenu.style.display = 'none';
                if (profilePage) profilePage.style.display = 'none';
            }
        }

        function getInitials(firstName, lastName) {
            const first = firstName ? firstName.charAt(0).toUpperCase() : '';
            const last = lastName ? lastName.charAt(0).toUpperCase() : '';
            return first + last;
        }

        function showProfile() {
            const profilePage = document.getElementById('profilePage');
            if (profilePage && currentUser) {
                document.querySelectorAll('section').forEach(section => {
                    section.style.display = 'none';
                });
                profilePage.style.display = 'block';
                updateProfilePage();
                showProfileSection('profileInfo');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

        function updateProfilePage() {
            if (!currentUser) return;
            
            document.getElementById('profilePageAvatar').textContent = getInitials(currentUser.name, currentUser.lastName);
            document.getElementById('profilePageName').textContent = currentUser.name + ' ' + (currentUser.lastName || '');
            document.getElementById('profilePageEmail').textContent = currentUser.email;
            document.getElementById('profileInfoEmail').textContent = currentUser.email;
            document.getElementById('profileFullName').textContent = currentUser.name + ' ' + (currentUser.lastName || '');
            document.getElementById('profilePhoneNumber').textContent = currentUser.phone || 'Не указан';
            document.getElementById('profileBirthDate').textContent = currentUser.birthDate ? formatDate(currentUser.birthDate) : 'Не указана';
            document.getElementById('profileRegistered').textContent = currentUser.registrationDate ? formatDate(currentUser.registrationDate) : formatDate(new Date());
            document.getElementById('lastLogin').textContent = formatDate(new Date());
            updateAddressList();
        }

        function showProfileSection(sectionId) {
            document.querySelectorAll('.profile-section').forEach(section => {
                section.style.display = 'none';
            });
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) selectedSection.style.display = 'block';
            
            document.querySelectorAll('.profile-menu a').forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.profile-menu a[href="#${sectionId}"]`);
            if (activeLink) activeLink.classList.add('active');
        }

        function showAddresses() {
            showProfile();
            showProfileSection('profileAddress');
        }

        function updateAddressList() {
            const addressList = document.getElementById('addressList');
            if (!addressList) return;

            if (userAddresses.length === 0) {
                addressList.innerHTML = '<p>Адресов нет</p>';
                return;
            }

            let html = '';
            userAddresses.forEach((address, index) => {
                const isActive = address.isDefault ? 'active' : '';
                const typeIcon = address.type === 'home' ? '🏠' : address.type === 'work' ? '🏢' : '📍';
                html += `
                    <div class="address-item ${isActive}">
                        <div class="address-item-header">
                            <strong>${typeIcon} ${address.name}</strong>
                            <div class="address-actions">
                                ${address.isDefault ? '<span style="color: #27ae60;">Основной</span>' : 
                                `<button class="btn-small" onclick="setDefaultAddress(${index})">Сделать основным</button>`}
                                <button class="btn-small delete" onclick="deleteAddress(${index})">Удалить</button>
                            </div>
                        </div>
                        <p>${address.full}</p>
                        <p>${address.city}${address.postal ? ', ' + address.postal : ''}</p>
                        ${address.instructions ? `<p><small>${address.instructions}</small></p>` : ''}
                    </div>
                `;
            });
            addressList.innerHTML = html;
        }

        function setDefaultAddress(index) {
            userAddresses.forEach(addr => addr.isDefault = false);
            userAddresses[index].isDefault = true;
            saveAddresses();
            updateAddressList();
            showNotification('Основной адрес изменен');
        }

        function deleteAddress(index) {
            if (confirm('Вы действительно хотите удалить этот адрес?')) {
                userAddresses.splice(index, 1);
                saveAddresses();
                updateAddressList();
                showNotification('Адрес удален');
            }
        }

        function saveAddresses() {
            if (currentUser) {
                localStorage.setItem('myshop_addresses_' + currentUser.id, JSON.stringify(userAddresses));
            }
        }

        function showLogin() {
            closeAllModals();
            document.getElementById('loginModal').style.display = 'flex';
        }

        function showRegister() {
            closeAllModals();
            document.getElementById('registerModal').style.display = 'flex';
        }

        function showEditProfile() {
            if (!currentUser) return;
            document.getElementById('profileName').value = currentUser.name || '';
            document.getElementById('profileLastName').value = currentUser.lastName || '';
            document.getElementById('profileEmail').value = currentUser.email || '';
            document.getElementById('profilePhone').value = currentUser.phone || '';
            document.getElementById('profileBirthDate').value = currentUser.birthDate || '';
            closeAllModals();
            document.getElementById('profileModal').style.display = 'flex';
        }

        function showAddressModal() {
            if (!currentUser) {
                showLogin();
                return;
            }
            document.getElementById('addressForm').reset();
            closeAllModals();
            document.getElementById('addressModal').style.display = 'flex';
        }

        function closeAllModals() {
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('registerModal').style.display = 'none';
            document.getElementById('profileModal').style.display = 'none';
            document.getElementById('addressModal').style.display = 'none';
            document.getElementById('adminPasswordModal').style.display = 'none';
        }

        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }

        function login() {
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showError('loginEmailError', 'Заполните все поля');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('myshop_users') || '[]');
            const user = users.find(u => (u.email === email || u.phone === email) && u.password === password);
            
            if (user) {
                currentUser = user;
                localStorage.setItem('myshop_user', JSON.stringify(user));
                localStorage.setItem('myshop_last_login', new Date().toISOString());
                closeModal('loginModal');
                updateUI();
                loadUserAddresses();
                showNotification('Добро пожаловать, ' + user.name + '!');
            } else {
                showError('loginEmailError', 'Неверные данные для входа');
            }
        }

        function register() {
            const name = document.getElementById('regName').value;
            const lastName = document.getElementById('regLastName').value;
            const email = document.getElementById('regEmail').value;
            const phone = document.getElementById('regPhone').value;
            const birthDate = document.getElementById('regBirthDate').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            
            clearErrors();
            let hasError = false;
            
            if (!name) { showError('regNameError', 'Введите имя'); hasError = true; }
            if (!lastName) { showError('regLastNameError', 'Введите фамилию'); hasError = true; }
            if (!email || !validateEmail(email)) { showError('regEmailError', 'Введите корректный email'); hasError = true; }
            if (!phone || !validatePhone(phone)) { showError('regPhoneError', 'Введите корректный номер телефона'); hasError = true; }
            if (!password || password.length < 6) { showError('regPasswordError', 'Пароль должен быть не менее 6 символов'); hasError = true; }
            if (password !== confirmPassword) { showError('regConfirmPasswordError', 'Пароли не совпадают'); hasError = true; }
            
            if (hasError) return;
            
            const users = JSON.parse(localStorage.getItem('myshop_users') || '[]');
            if (users.some(u => u.email === email)) {
                showError('regEmailError', 'Пользователь с таким email уже существует');
                return;
            }
            if (users.some(u => u.phone === phone)) {
                showError('regPhoneError', 'Пользователь с таким телефоном уже существует');
                return;
            }
            
            const newUser = {
                id: Date.now(),
                name: name,
                lastName: lastName,
                email: email,
                phone: phone,
                birthDate: birthDate,
                password: password,
                registrationDate: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('myshop_users', JSON.stringify(users));
            localStorage.setItem('myshop_user', JSON.stringify(newUser));
            localStorage.setItem('myshop_last_login', new Date().toISOString());
            
            currentUser = newUser;
            closeModal('registerModal');
            updateUI();
            loadUserAddresses();
            showNotification('Регистрация успешно завершена! Добро пожаловать!');
        }

        function saveProfile() {
            if (!currentUser) return;
            
            currentUser.name = document.getElementById('profileName').value || currentUser.name;
            currentUser.lastName = document.getElementById('profileLastName').value || currentUser.lastName;
            currentUser.email = document.getElementById('profileEmail').value || currentUser.email;
            currentUser.phone = document.getElementById('profilePhone').value || currentUser.phone;
            currentUser.birthDate = document.getElementById('profileBirthDate').value || currentUser.birthDate;
            
            localStorage.setItem('myshop_user', JSON.stringify(currentUser));
            
            const users = JSON.parse(localStorage.getItem('myshop_users') || '[]');
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = currentUser;
                localStorage.setItem('myshop_users', JSON.stringify(users));
            }
            
            closeModal('profileModal');
            updateUI();
            updateProfilePage();
            showNotification('Профиль успешно сохранен!');
        }

        function saveAddress() {
            if (!currentUser) return;
            
            const name = document.getElementById('addressName').value;
            const full = document.getElementById('addressFull').value;
            const city = document.getElementById('addressCity').value;
            const postal = document.getElementById('addressPostal').value;
            const type = document.querySelector('input[name="addressType"]:checked').value;
            const instructions = document.getElementById('addressInstructions').value;
            
            if (!name || !full || !city) {
                showNotification('Заполните все обязательные поля!');
                return;
            }
            
            const newAddress = {
                id: Date.now(),
                name: name,
                full: full,
                city: city,
                postal: postal,
                type: type,
                instructions: instructions,
                isDefault: userAddresses.length === 0
            };
            
            userAddresses.push(newAddress);
            saveAddresses();
            updateAddressList();
            closeModal('addressModal');
            showNotification('Адрес успешно добавлен!');
        }

        function logout() {
            if (confirm('Вы действительно хотите выйти?')) {
                localStorage.removeItem('myshop_user');
                currentUser = null;
                userAddresses = [];
                updateUI();
                document.querySelectorAll('section').forEach(section => {
                    section.style.display = 'block';
                });
                document.getElementById('profilePage').style.display = 'none';
                showNotification('Вы успешно вышли из системы');
            }
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
        }

        function validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        function validatePhone(phone) {
            return /^\+?[0-9\s\-\(\)]{10,}$/.test(phone);
        }

        function showError(elementId, message) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = message;
                element.style.display = 'block';
            }
        }

        function clearErrors() {
            document.querySelectorAll('.form-error').forEach(el => {
                el.style.display = 'none';
                el.textContent = '';
            });
        }

        function showNotification(message) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #2ecc71;
                color: white;
                padding: 15px 25px;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 3000;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 3000);
        }

        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };
