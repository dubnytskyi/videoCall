# 🚀 Деплой сервера на Vercel

## 📋 Перед деплоєм

### 1. Налаштування змінних середовища

У Vercel Dashboard додайте наступні змінні середовища:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_API_KEY_SID=your_twilio_api_key_sid
TWILIO_API_KEY_SECRET=your_twilio_api_key_secret

# Server Configuration
NODE_ENV=production
SERVER_URL=https://your-app.vercel.app
```

### 2. Встановлення Vercel CLI

```bash
npm install -g vercel
```

## 🚀 Деплой

### Варіант 1: Через Vercel CLI

```bash
cd server
vercel --prod
```

### Варіант 2: Через GitHub

1. Пуште код на GitHub
2. Підключіть репозиторій до Vercel
3. Налаштуйте змінні середовища в Dashboard
4. Деплойте

## ⚠️ Важливі обмеження Vercel

### WebSocket підтримка
Vercel **НЕ підтримує** WebSocket сервери в serverless функціях. Для PDF колаборації потрібен WebSocket, тому:

1. **Для тестування** - використовуйте локальний сервер
2. **Для продакшену** - розгляньте альтернативи:
   - Railway.app
   - Render.com
   - DigitalOcean App Platform
   - AWS EC2

### Альтернативні рішення для WebSocket

#### 1. Railway.app
```bash
# Встановіть Railway CLI
npm install -g @railway/cli

# Деплойте
railway login
railway init
railway up
```

#### 2. Render.com
- Підтримує WebSocket
- Безкоштовний план доступний
- Простий деплой з GitHub

#### 3. DigitalOcean App Platform
- Підтримує WebSocket
- Платно, але надійно

## 🔧 Налаштування після деплою

### 1. Оновіть URL в клієнті

Змініть URL WebSocket в `client/src/contexts/YjsContext.tsx`:

```typescript
// Замість
const ws = new WebSocket(`ws://localhost:1234?room=${roomId}`);

// Використовуйте
const ws = new WebSocket(`wss://your-app.railway.app?room=${roomId}`);
```

### 2. Оновіть API URL

Змініть URL API в `client/src/lib/pdfExport.ts`:

```typescript
// Замість
export function sendToBackend(data: ExportData, endpoint: string = '/api/pdf-template')

// Використовуйте
export function sendToBackend(data: ExportData, endpoint: string = 'https://your-app.vercel.app/api/pdf-template')
```

## 📊 Моніторинг

### Vercel Analytics
- Переглядайте логи в Vercel Dashboard
- Моніторте performance метрики

### Railway/Render
- Вбудовані логи та моніторинг
- Health checks доступні

## 🐛 Troubleshooting

### Проблема: WebSocket не працює на Vercel
**Рішення**: Використовуйте Railway.app або Render.com

### Проблема: Environment variables не завантажуються
**Рішення**: Перевірте назви змінних в Dashboard

### Проблема: CORS помилки
**Рішення**: Оновіть CORS налаштування в `server/src/index.ts`

## 📝 Приклад деплою на Railway

```bash
# 1. Встановіть Railway CLI
npm install -g @railway/cli

# 2. Увійдіть в акаунт
railway login

# 3. Ініціалізуйте проект
cd server
railway init

# 4. Додайте змінні середовища
railway variables set TWILIO_ACCOUNT_SID=your_sid
railway variables set TWILIO_AUTH_TOKEN=your_token
railway variables set TWILIO_API_KEY_SID=your_key_sid
railway variables set TWILIO_API_KEY_SECRET=your_key_secret

# 5. Деплойте
railway up
```

## 🎯 Рекомендації

1. **Для розробки**: Використовуйте локальний сервер
2. **Для тестування**: Railway.app (безкоштовно)
3. **Для продакшену**: Render.com або DigitalOcean
4. **Для масштабування**: AWS EC2 з Load Balancer

## 📞 Підтримка

Якщо виникають проблеми з деплоєм:
1. Перевірте логи в Dashboard
2. Переконайтеся що всі змінні середовища встановлені
3. Перевірте що WebSocket підтримується платформою
4. Зверніться до документації платформи