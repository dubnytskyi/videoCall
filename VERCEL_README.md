# 🚀 Vercel Deployment - Notary Video Call POC

Простий гід по деплою на Vercel для вашого POC проекту.

## 📋 Передумови

1. **Vercel акаунт** - [vercel.com](https://vercel.com)
2. **Vercel CLI** - `npm install -g vercel`
3. **Git репозиторій** - проект в GitHub
4. **Twilio облікові дані** - Account SID, API Key SID, API Key Secret

## 🚀 Швидкий старт

### 1. Підготовка
```bash
# Встановити Vercel CLI
npm install -g vercel

# Увійти в акаунт
vercel login
```

### 2. Деплой
```bash
# Автоматичний деплой
./deploy-vercel.sh

# Або вручну
vercel --prod
```

### 3. Налаштування змінних
```bash
# Додати Twilio ключі
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_API_KEY_SID
vercel env add TWILIO_API_KEY_SECRET
```

## 🔧 Структура проекту

```
VIdeoCall/
├── vercel.json              # Vercel конфігурація
├── server/
│   ├── vercel.json          # Сервер конфігурація
│   ├── src/index.ts         # API endpoints
│   └── package.json         # Сервер залежності
├── client/
│   ├── src/
│   │   ├── config.ts        # Автоматична конфігурація
│   │   └── lib/twilioToken.ts # API клієнт
│   └── package.json         # Клієнт залежності
└── deploy-vercel.sh         # Скрипт деплою
```

## 🌐 API Endpoints

Після деплою будуть доступні:

- `GET /api/health` - Health check
- `POST /api/token` - Twilio token generation

## 🔧 Налаштування

### Автоматична конфігурація
Клієнт автоматично визначає URL:
- **Development**: `http://localhost:4000`
- **Production**: `https://your-app.vercel.app`

### Змінні середовища
Встановіть в Vercel Dashboard:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_API_KEY_SID`
- `TWILIO_API_KEY_SECRET`

## 📊 Переваги Vercel

- ✅ **Безкоштовно** - 100GB bandwidth/місяць
- ✅ **Швидко** - глобальна CDN
- ✅ **Просто** - git push деплой
- ✅ **Безпечно** - HTTPS включений
- ✅ **Масштабовано** - serverless функції

## 🛠️ Troubleshooting

### Помилка "Environment variables not set"
```bash
# Перевірити змінні
vercel env ls

# Додати відсутні
vercel env add VARIABLE_NAME
```

### Помилка "Build failed"
```bash
# Подивитися логи
vercel logs

# Перевірити локально
npm run build
```

### Помилка "API not found"
- Перевірити `vercel.json` конфігурацію
- Переконатися, що сервер запускається

## 🔗 Корисні команди

```bash
# Деплой
vercel --prod

# Логи
vercel logs

# Змінні середовища
vercel env ls
vercel env add NAME
vercel env rm NAME

# Статус
vercel ls
```

## 📝 Наступні кроки

1. ✅ Деплой на Vercel
2. ✅ Налаштування Twilio ключів
3. ✅ Тестування API
4. ✅ Оновлення клієнта
5. ✅ Тестування відеодзвінків

## 💡 Поради

- **Завжди тестуйте локально** перед деплоєм
- **Використовуйте .env файли** для локальної розробки
- **Моніторьте логи** після деплою
- **Регулярно оновлюйте залежності**
