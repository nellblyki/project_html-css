// Получаем элементы модального окна
const modal = document.getElementById('authModal');
const userIcon = document.querySelector('.kaha img[src="assets/img\'s/Frame 5.svg"]');
const closeBtn = document.querySelector('.close');
const tabBtns = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.auth-form');

// Функция для отображения ошибок
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#ff4444';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.textAlign = 'center';
    errorDiv.textContent = message;
    
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const activeForm = document.querySelector('.auth-form.active');
    activeForm.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Открытие модального окна при клике на иконку пользователя
userIcon.addEventListener('click', () => {
    modal.style.display = 'block';
});

// Закрытие модального окна
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Закрытие при клике вне модального окна
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Переключение между вкладками
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Form`).classList.add('active');
    });
});

// Обработка формы входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            modal.style.display = 'none';
            updateUIAfterAuth(data.user);
        } else {
            showError(data.message || 'Ошибка при входе');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
    }
});

// Обработка формы регистрации
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelectorAll('input[type="password"]')[0].value;
    const confirmPassword = e.target.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
        showError('Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        showError('Пароль должен содержать минимум 6 символов');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            modal.style.display = 'none';
            updateUIAfterAuth(data.user);
        } else {
            showError(data.message || 'Ошибка при регистрации');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showError('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
    }
});

// Функция для обновления UI после авторизации
function updateUIAfterAuth(user) {
    const userIconContainer = document.querySelector('.kaha');
    const userIcon = userIconContainer.querySelector('img');
    const userName = document.getElementById('userName');
    const userInfo = document.getElementById('userInfo');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelector('.auth-tabs');

    // Создаем HTML для замены иконки
    userIconContainer.innerHTML = `
        <div class="search-container">
            <img src="assets/img's/lupa.svg" alt="">
            <input type="text" placeholder="Search for products..." class="search-bar">
        </div>
        <div style="display: flex; align-items: center; gap: 20px; padding-left: 20px; justify-content: space-beetwen;">
            <span style="font-family: 'Satoshi', sans-serif; font-size: 16px; cursor: pointer;">${user.name}</span>
            <span style="font-family: 'Satoshi', sans-serif;  font-weight: 700; font-size: 16px; cursor: pointer; color: black;">Log Out</span>
        </div>
    `;

    // Добавляем обработчики кликов
    const nameElement = userIconContainer.querySelector('span:first-of-type');
    const logoutElement = userIconContainer.querySelector('span:last-of-type');

    nameElement.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    logoutElement.addEventListener('click', () => {
        logout();
        modal.style.display = 'none';
    });

    // Обновляем модальное окно
    userName.textContent = user.name;
    userInfo.style.display = 'block';
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    authTabs.style.display = 'none';
}

// Функция для выхода из системы
function logout() {
    // Удаляем токен
    localStorage.removeItem('token');
    
    // Восстанавливаем исходный HTML
    const userIconContainer = document.querySelector('.kaha');
    userIconContainer.innerHTML = `
        <div class="search-container">
            <img src="assets/img's/lupa.svg" alt="">
            <input type="text" placeholder="Search for products..." class="search-bar">
        </div>
        <img src="assets/img's/Frame 5.svg" alt="">
    `;

    // Добавляем обработчик клика на иконку
    const userIcon = userIconContainer.querySelector('img[src="assets/img\'s/Frame 5.svg"]');
    userIcon.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Сбрасываем модальное окно
    const userInfo = document.getElementById('userInfo');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelector('.auth-tabs');

    userInfo.style.display = 'none';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    authTabs.style.display = 'flex';

    // Очищаем формы
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

// Добавляем обработчик для кнопки выхода
document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    modal.style.display = 'none';
});

// Обновляем функцию проверки авторизации
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                updateUIAfterAuth(user);
            } else {
                // Если токен недействителен, выходим из системы
                logout();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            logout();
        }
    }
}

document.addEventListener('DOMContentLoaded', checkAuth); 