# 🚀 Quick Start - Vercel Server + ngrok Frontend

Швидкий старт для розробки з сервером на Vercel та фронтендом через ngrok.

## ✅ Що вже готово

- ✅ **Сервер задеплоєний** на Vercel
- ✅ **Twilio ключі налаштовані** в Vercel
- ✅ **Конфігурація оновлена** для автоматичного визначення URL
- ✅ **Скрипти створені** для швидкого запуску

## 🚀 Запуск за 2 хвилини

### 1. Встановити ngrok
```bash
# macOS
brew install ngrok/ngrok/ngrok

# Linux
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

### 2. Аутентифікувати ngrok
```bash
# Отримати токен з https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_TOKEN
```

### 3. Запустити все одразу
```bash
./start-dev-with-ngrok.sh
```

## 🌐 URL адреси

- **Frontend (ngrok)**: `https://xxxxx.ngrok.io` (динамічний)
- **Backend (Vercel)**: `https://video-call-1rxqdfgut-taldevs-projects-f39a0564.vercel.app`

## 🔧 Як це працює

1. **Фронтенд** запускається локально на `localhost:5173`
2. **ngrok** створює публічний туннель до фронтенду
3. **Клієнт** автоматично визначає, що використовувати Vercel API
4. **Відеодзвінки** працюють через Twilio з токенами з Vercel

## 📝 Тестування

1. Відкрийте ngrok URL у **двох вкладках**
2. В одній вкладці натисніть **"Join as Notary"**
3. В іншій вкладці натисніть **"Join as Client"**
4. Тестуйте відеодзвінки та PDF редагування

## 🛠️ Корисні команди

```bash
# Запуск розробки
./start-dev-with-ngrok.sh

# Тестування API
./test-api.sh

# Перевірка ngrok
ngrok status

# Логи ngrok
ngrok http 5173 --log=stdout
```

## 🔧 Troubleshooting

### ngrok не запускається
```bash
# Перевірити аутентифікацію
ngrok config check

# Перевірити статус
ngrok status
```

### API не працює
- Vercel може потребувати аутентифікації
- Перевірте в браузері: https://video-call-1rxqdfgut-taldevs-projects-f39a0564.vercel.app/api/health

### CORS помилки
- Переконайтеся, що використовується правильний API URL
- Перевірте `client/src/config.ts`

## 📊 Переваги цього підходу

- ✅ **Швидка розробка** - зміни фронтенду миттєво
- ✅ **Стабільний сервер** - завжди доступний на Vercel
- ✅ **Легке тестування** - публічний URL через ngrok
- ✅ **Безкоштовно** - Vercel + ngrok безкоштовні
- ✅ **Простота** - один скрипт запускає все

## 🎯 Наступні кроки

1. ✅ Запустити розробку
2. ✅ Протестувати функціонал
3. ✅ Розробити нові фічі
4. ✅ Деплой фронтенду на Vercel (коли готово)

## 📚 Документація

- [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) - детальна інструкція
- [VERCEL_README.md](VERCEL_README.md) - Vercel документація
- [README.md](README.md) - основний README

## 💡 Поради

- **Зберігайте ngrok URL** для тестування
- **Використовуйте ngrok Pro** для стабільних URL
- **Моніторьте логи** при розробці
- **Тестуйте на різних пристроях** через ngrok






