# 🚀 Vercel Deployment Guide

Повний гід по деплою вашого Notary Video Call проекту на Vercel.

## 🏆 Чому Vercel?

### ✅ Переваги Vercel:
- **100GB bandwidth/місяць** безкоштовно
- **Автоматичний деплой** з GitHub
- **HTTPS включений**
- **Глобальна CDN**
- **Serverless функції**
- **Простий в налаштуванні**
- **Швидкий деплой**

## 🚀 Швидкий деплой

### Крок 1: Підготовка
```bash
# Встановити Vercel CLI
npm install -g vercel

# Увійти в акаунт
vercel login
```

### Крок 2: Деплой
```bash
# Запустити скрипт деплою
./deploy-vercel.sh

# Або вручну
vercel --prod
```

### Крок 3: Налаштування змінних
```bash
# Додати Twilio ключі
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_API_KEY_SID
vercel env add TWILIO_API_KEY_SECRET
```

## 🚂 Деплой на Railway

### Крок 1: Підготовка
1. Зареєструватися на [railway.app](https://railway.app)
2. Підключити GitHub репозиторій

### Крок 2: Налаштування
1. Створити новий проект
2. Додати змінні середовища:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_API_KEY_SID`
   - `TWILIO_API_KEY_SECRET`
3. Встановити `railway.json` конфігурацію

### Крок 3: Деплой
- Railway автоматично задеплоїть при push в GitHub

## 🎨 Деплой на Render

### Крок 1: Підготовка
1. Зареєструватися на [render.com](https://render.com)
2. Підключити GitHub репозиторій

### Крок 2: Створення сервісу
1. New → Web Service
2. Підключити репозиторій
3. Налаштування:
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Health Check Path**: `/health`

### Крок 3: Змінні середовища
Додати в Environment Variables:
- `NODE_ENV=production`
- `TWILIO_ACCOUNT_SID=your_sid`
- `TWILIO_API_KEY_SID=your_key_sid`
- `TWILIO_API_KEY_SECRET=your_secret`

## 🔧 Оновлення клієнта

Після деплою сервера, оновіть конфігурацію клієнта:

```typescript
// client/src/config.ts
export const config = {
  serverUrl: "https://your-project.vercel.app", // Vercel URL
  // або
  serverUrl: "https://your-project.railway.app", // Railway URL
  // або
  serverUrl: "https://your-project.onrender.com", // Render URL
};
```

## 📊 Порівняння хостингів

| Хостинг | Безкоштовний план | Автодеплой | HTTPS | Простота |
|---------|-------------------|------------|-------|----------|
| **Vercel** | 100GB/місяць | ✅ | ✅ | 🟢 Легко |
| **Railway** | $5 кредитів | ✅ | ✅ | 🟢 Легко |
| **Render** | 750 годин | ✅ | ✅ | 🟡 Середньо |
| **Heroku** | $7/місяць | ✅ | ✅ | 🟡 Середньо |

## 🎯 Рекомендації

### Для POC тестування:
- **Vercel** - найпростіший і найшвидший
- **Railway** - якщо потрібна база даних

### Для демонстрації:
- **Vercel** - професійний вигляд
- **Render** - стабільний хостинг

### Для продакшену:
- **Vercel** + **Railway** - комбінація
- **AWS/GCP** - хмарні рішення

## 🛠️ Troubleshooting

### Vercel помилки:
```bash
# Перевірити логи
vercel logs

# Перевірити змінні
vercel env ls
```

### Railway помилки:
- Перевірити Railway dashboard
- Подивитися логи в реальному часі

### Render помилки:
- Перевірити Render dashboard
- Подивитися build logs

## 📁 Структура файлів

```
VIdeoCall/
├── vercel.json              # Vercel конфігурація
├── railway.json             # Railway конфігурація
├── render.yaml              # Render конфігурація
├── deploy.sh                # Скрипт деплою
├── server/
│   ├── vercel.json          # Vercel для сервера
│   └── src/index.ts         # Сервер код
└── DEPLOYMENT_GUIDE.md      # Цей файл
```

## 🔗 Корисні посилання

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [Twilio Environment Variables](https://www.twilio.com/docs/usage/secure-credentials)

## 💡 Поради

1. **Завжди використовуйте HTTPS** - Twilio вимагає
2. **Не комітьте .env файли** - використовуйте змінні середовища
3. **Тестуйте локально** перед деплоєм
4. **Моніторьте логи** після деплою
5. **Використовуйте health check** для моніторингу
длядляої розробки і тестування