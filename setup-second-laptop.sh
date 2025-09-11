#!/bin/bash

echo "🖥️  Налаштування другого ноутбука для тестування"
echo "=================================================="
echo ""

# Get the server IP from user
read -p "Введіть IP адресу першого ноутбука (наприклад, 192.168.0.150): " SERVER_IP

if [ -z "$SERVER_IP" ]; then
    echo "❌ IP адреса не може бути порожньою"
    exit 1
fi

echo "🔧 Налаштування підключення до сервера: $SERVER_IP"

# Update config.ts
cat > client/src/config.ts << EOF
// Configuration for the client application
export const config = {
  // Server URL - points to the first laptop
  serverUrl: "http://$SERVER_IP:4000",
  
  // Video room name
  roomName: "notary-room",
  
  // Participant identities
  identities: {
    notary: "Notary",
    client: "Client"
  }
};

// Helper function to get server URL
export function getServerUrl(): string {
  // Always use the configured server URL for second laptop
  return config.serverUrl;
}
EOF

echo "✅ Конфігурація оновлена"

# Test connection to server
echo "🔍 Тестування з'єднання з сервером..."
if curl -s "http://$SERVER_IP:4000/health" > /dev/null; then
    echo "✅ З'єднання з сервером працює!"
else
    echo "❌ Не вдалося підключитися до сервера"
    echo "   Перевірте:"
    echo "   1. Чи запущений сервер на першому ноутбуці"
    echo "   2. Чи правильна IP адреса"
    echo "   3. Чи не блокує firewall"
    exit 1
fi

echo ""
echo "🚀 Запуск клієнта..."
echo "   Відкрийте браузер і перейдіть на:"
echo "   http://localhost:5173"
echo ""
echo "   Натисніть 'Join as Client'"
echo ""

# Start only the client
cd client && npm run dev


