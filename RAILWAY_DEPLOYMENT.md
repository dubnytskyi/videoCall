# Railway.app Deployment Guide

## Проблема з Vercel
Vercel не підтримує WebSocket сервери, тому потрібно використовувати іншу платформу для сервера.

## Railway.app Deployment

### 1. Підготовка
1. Зареєструйтесь на [Railway.app](https://railway.app)
2. Підключіть GitHub репозиторій

### 2. Налаштування змінних середовища
У Railway Dashboard додайте наступні змінні:

```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
PORT=4000
WS_PORT=1234
NODE_ENV=production
```

### 3. Деплой
1. Railway автоматично виявить кореневий `package.json`
2. Запустить `npm install` (встановить залежності для всього проекту)
3. Запустить `npm run build:server` (збере сервер)
4. Запустить `npm start` (запустить сервер з папки `server/`)

### 4. Отримання URL
Після деплою Railway надасть URL типу:
- HTTP API: `https://your-app-name.railway.app`
- WebSocket: `wss://your-app-name.railway.app:1234`

### 5. Оновлення клієнта
Оновіть `client/src/config.ts`:

```typescript
export function getServerUrl(): string {
  return "https://your-app-name.railway.app";
}
```

## Альтернативи

### Render.com
1. Створіть новий Web Service
2. Підключіть GitHub репозиторій
3. Встановіть:
   - Build Command: `cd server && npm install && npm run build`
   - Start Command: `cd server && npm start`
   - Environment: Node

### DigitalOcean App Platform
1. Створіть новий App
2. Підключіть GitHub репозиторій
3. Встановіть:
   - Source Directory: `server/`
   - Build Command: `npm run build`
   - Run Command: `npm start`

## Перевірка
Після деплою перевірте:
1. `https://your-server-url/api/health` - має повернути `{"status":"ok"}`
2. WebSocket підключення в консолі браузера
3. Синхронізацію полів між нотаріусом та клієнтом
