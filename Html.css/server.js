require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Раздача статических файлов из текущей директории

// Имитация базы данных (хранится только в памяти сервера)
const users = new Map();

// Middleware для проверки JWT токена
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = users.get(decoded.userId);
        
        if (!user) {
            throw new Error();
        }
        
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Пожалуйста, авторизуйтесь' });
    }
};

// Роуты для аутентификации
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Проверка существования пользователя
        for (const user of users.values()) {
            if (user.email === email) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание нового пользователя
        const userId = Date.now().toString();
        const user = {
            id: userId,
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        users.set(userId, user);

        // Создание JWT токена
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Ошибка при регистрации' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Поиск пользователя
        let foundUser = null;
        for (const user of users.values()) {
            if (user.email === email) {
                foundUser = user;
                break;
            }
        }

        if (!foundUser) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверка пароля
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { userId: foundUser.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: foundUser.id,
                name: foundUser.name,
                email: foundUser.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Ошибка при входе' });
    }
});

// Получение информации о текущем пользователе
app.get('/api/auth/me', auth, async (req, res) => {
    try {
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 