# Исправление проблемы с initData

## Проблема
`initData` отсутствует даже при открытии приложения из Telegram.

## Что было исправлено

### 1. Множественные методы получения initData

Код теперь пытается получить `initData` из нескольких источников:

1. **WebApp.initData** (стандартный метод)
2. **WebApp.initDataRaw** (альтернативный метод)
3. **window.Telegram.WebApp.initData** (прямой доступ)
4. **URL параметры** (`tgWebAppData` или `_auth`)
5. **Hash параметры** (для некоторых версий Telegram)
6. **Конструкция из initDataUnsafe** (fallback, может не работать для auth)

### 2. Ожидание загрузки SDK

Код теперь ждет загрузки Telegram SDK перед инициализацией:
- Проверяет наличие `window.Telegram.WebApp`
- Ожидает до 2 секунд
- Затем инициализирует приложение

### 3. Детальное логирование

Добавлено подробное логирование для диагностики:
- Какой метод использован для получения initData
- Длина initData
- Все доступные свойства WebApp объекта
- URL страницы
- Информация о версии Telegram

## Как проверить

### 1. Откройте приложение из Telegram

**ВАЖНО:** Приложение должно открываться ТОЛЬКО из Telegram бота, не напрямую в браузере!

### 2. Откройте DevTools (F12) → Console

Проверьте логи:

**Успешный случай:**
```
[Telegram] Window loaded
[Telegram] ✅ initData from WebApp.initData, length: 1234
[Telegram] ✅ initData available, length: 1234
[Auth] Starting authentication...
```

**Проблемный случай:**
```
[Telegram] ❌ initData is missing!
[Telegram] WebApp object: {...}
[Telegram] URL: https://app.example.com/...
```

### 3. Проверьте настройки бота

1. Откройте @BotFather в Telegram
2. Выберите вашего бота
3. Выберите "Bot Settings" → "Menu Button" или "Web App"
4. Убедитесь, что URL правильный: `https://app.example.com`
5. Сохраните изменения

### 4. Проверьте домен

- Домен в @BotFather должен точно совпадать с реальным доменом
- Должен использоваться HTTPS (не HTTP)
- Домен должен быть доступен из интернета

### 5. Проверьте логи backend

На VM:
```bash
cd /opt/makemefit/infra
docker-compose logs -f backend | grep -i auth
```

Ожидаемые логи:
```
[Auth] Received auth request, init_data length: 1234
[Auth] Success: User 123456789 authenticated
```

## Частые ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `initData is missing` | Приложение открыто не из Telegram | Откройте из бота |
| `initData is missing` | Неправильный URL в @BotFather | Проверьте и исправьте URL |
| `initData is missing` | Домен не использует HTTPS | Настройте SSL сертификат |
| `Hash mismatch` | Неправильный TELEGRAM_BOT_TOKEN | Проверьте токен в backend/.env |

## Если ничего не помогает

1. **Перезапустите бота:**
   - В @BotFather: `/revoke` → выберите бота → подтвердите
   - Создайте новый токен
   - Обновите `TELEGRAM_BOT_TOKEN` в `backend/.env`
   - Перезапустите backend

2. **Проверьте версию Telegram:**
   - Обновите Telegram до последней версии
   - Старые версии могут не поддерживать Web Apps

3. **Проверьте настройки безопасности:**
   - Убедитесь, что домен не заблокирован
   - Проверьте CORS настройки в backend

4. **Используйте тестовый бот:**
   - Создайте нового бота через @BotFather
   - Настройте Web App для тестового бота
   - Проверьте, работает ли с тестовым ботом

## Отладка

Если initData все еще отсутствует, проверьте в консоли:

```javascript
// В DevTools Console
console.log('WebApp:', window.Telegram?.WebApp);
console.log('initData:', window.Telegram?.WebApp?.initData);
console.log('initDataUnsafe:', window.Telegram?.WebApp?.initDataUnsafe);
console.log('URL:', window.location.href);
```

Отправьте эти логи для дальнейшей диагностики.
