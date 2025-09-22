# 🚀 Development Setup - Vercel Server + ngrok Frontend

Оптимальний підхід для швидкої розробки: сервер на Vercel, фронтенд локально з ngrok.

## 🎯 Переваги цього підходу

- ✅ **Стабільний сервер** - завжди доступний на Vercel
- ✅ **Швидка розробка** - зміни фронтенду миттєво
- ✅ **Легке тестування** - ngrok дає публічний URL
- ✅ **Безкоштовно** - Vercel + ngrok безкоштовні
- ✅ **Простота** - один скрипт запускає все

## 🚀 Швидкий старт

### 1. Підготовка
```bash
# Встановити ngrok (якщо ще не встановлений)
brew install ngrok/ngrok/ngrok

# Аутентифікувати ngrok
ngrok config add-authtoken YOUR_TOKEN
```

### 2. Запуск
```bash
# Запустити все одразу
./start-dev-with-ngrok.sh
```

### 3. Тестування
- Відкрийте ngrok URL у двох вкладках
- Приєднайтесь як "Notary" в одній
- Приєднайтесь як "Client" в іншій
- Тестуйте відеодзвінки та PDF редагування

## 🔧 Детальна інструкція

### Крок 1: Налаштування ngrok

1. **Зареєструватися** на [ngrok.com](https://ngrok.com)
2. **Отримати authtoken** з dashboard
3. **Встановити ngrok:**
   ```bash
   # macOS
   brew install ngrok/ngrok/ngrok
   
   # Linux
   curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
   echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
   sudo apt update && sudo apt install ngrok
   ```

4. **Аутентифікувати:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

### Крок 2: Запуск розробки

```bash
# Автоматичний запуск
./start-dev-with-ngrok.sh

# Або вручну:
# Термінал 1: Запустити клієнт
cd client && npm run dev

# Термінал 2: Запустити ngrok
ngrok http 5173
```

### Крок 3: Тестування

1. **Отримати ngrok URL** з консолі
2. **Відкрити в браузері** у двох вкладках
3. **Тестувати функціонал:**
   - Відеодзвінки
   - PDF редагування
   - Синхронізація даних

## 🌐 Архітектура

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   ngrok tunnel   │    │   Vercel API    │
│   (localhost)   │◄──►│   (public URL)   │◄──►│   (production)  │
│   :5173         │    │   ngrok.io       │    │   vercel.app    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔧 Конфігурація

### Автоматичне визначення URL
Клієнт автоматично визначає, який сервер використовувати:

```typescript
// client/src/config.ts
export function getServerUrl(): string {
  // Vercel production
  if (window.location.hostname.includes("vercel.app")) {
    return `https://${window.location.hostname}`;
  }
  
  // ngrok development
  if (window.location.hostname.includes("ngrok")) {
    return "https://video-call-1rxqdfgut-taldevs-projects-f39a0564.vercel.app";
  }
  
  // Local development
  return "http://localhost:4000";
}
```

## 📊 Порівняння підходів

| Підхід | Сервер | Фронтенд | Складність | Швидкість |
|--------|--------|----------|------------|-----------|
| **Локально** | localhost:4000 | localhost:5173 | 🟢 Легко | 🟢 Швидко |
| **Vercel + ngrok** | vercel.app | ngrok.io | 🟡 Середньо | 🟢 Швидко |
| **Повний Vercel** | vercel.app | vercel.app | 🟡 Середньо | 🟡 Повільно |

## 🛠️ Troubleshooting

### ngrok не запускається
```bash
# Перевірити аутентифікацію
ngrok config check

# Перевірити статус
ngrok status
```

### API не працює
```bash
# Тестувати API
./test-api.sh

# Перевірити в браузері
open https://video-call-1rxqdfgut-taldevs-projects-f39a0564.vercel.app/api/health
```

### CORS помилки
- Перевірити, чи правильно налаштований `getServerUrl()`
- Переконатися, що використовується правильний API URL

## 🔗 Корисні команди

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

## 📝 Наступні кроки

1. ✅ Налаштувати ngrok
2. ✅ Запустити розробку
3. ✅ Протестувати функціонал
4. ✅ Розробити нові фічі
5. ✅ Деплой на Vercel (коли готово)

## 💡 Поради

- **Використовуйте ngrok Pro** для стабільних URL
- **Зберігайте ngrok URL** для тестування
- **Моніторьте логи** при розробці
- **Тестуйте на різних пристроях** через ngrok
- **Регулярно оновлюйте** залежності






