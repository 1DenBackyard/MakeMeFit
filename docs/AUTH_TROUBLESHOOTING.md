# Troubleshooting Authentication Issues

## Симптом: "initData is missing" или "Authentication Failed"

### ⚠️ ВАЖНО: initData может отсутствовать по нескольким причинам

#### 1. initData отсутствует или пустой (самая частая проблема)

**Признаки:**
- В консоли браузера: `[Telegram] initData is missing!`
- Ошибка: "Telegram authentication data is missing"

**Причины:**
- Приложение открыто не из Telegram (напрямую в браузере)
- Telegram WebApp SDK не инициализирован

**Решение:**
1. **Проверьте настройки бота в @BotFather:**
   ```
   /newapp
   Выберите бота
   Укажите название приложения
   Укажите URL: https://app.example.com
   Сохраните
   ```

2. **Проверьте, что приложение открывается из бота:**
   - Откройте бота в Telegram
   - Нажмите на кнопку с Web App (или команду /start если настроена)
   - НЕ открывайте URL напрямую в браузере!

3. **Проверьте логи в консоли браузера:**
   - Откройте DevTools (F12)
   - Посмотрите логи `[Telegram]`
   - Должно быть: `✅ initData available, length: XXX`

4. **Если initData все еще отсутствует:**
   - Проверьте, что домен в @BotFather совпадает с реальным доменом
   - Убедитесь, что используется HTTPS (Telegram требует HTTPS)
   - Проверьте, что бот активен и не заблокирован

#### 2. Неправильный TELEGRAM_BOT_TOKEN

**Признаки:**
- В логах backend: `[Auth] Error: Hash mismatch`
- Ошибка: "Invalid Telegram initData"

**Причины:**
- Токен бота в `.env` не совпадает с токеном бота, из которого открыт Mini App
- Токен не установлен или пустой

**Решение:**
```bash
# На VM проверьте токен
cd /opt/makemefit
grep TELEGRAM_BOT_TOKEN backend/.env

# Убедитесь, что токен правильный (из @BotFather)
# Формат: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

#### 3. initData истек (старше 24 часов)

**Признаки:**
- В логах backend: `[Auth] Error: auth_date is too old`
- Ошибка: "Invalid Telegram initData"

**Решение:**
- Просто перезагрузите приложение в Telegram
- initData обновится автоматически

#### 4. Проблемы с CORS или сетью

**Признаки:**
- В консоли браузера: `[API] Error: Network error`
- Ошибка: "Cannot connect to server"

**Решение:**
```bash
# Проверьте, что backend доступен
curl https://api.example.com/health

# Проверьте CORS настройки в backend/app/main.py
# Должно быть разрешено для домена app.example.com
```

#### 5. Backend не запущен или недоступен

**Признаки:**
- В консоли: `[API] Error: Failed to fetch`
- Ошибка: "Cannot connect to server"

**Решение:**
```bash
# На VM проверьте статус
cd /opt/makemefit/infra
docker-compose ps

# Проверьте логи
docker-compose logs backend | tail -50

# Перезапустите если нужно
docker-compose restart backend
```

## Диагностика

### 1. Проверка в браузере (DevTools Console)

Откройте DevTools → Console и проверьте логи:

```
[Telegram] User detected: {...}
[Telegram] initData available, length: 1234
[Auth] Starting authentication...
[API] POST http://localhost:8000/auth/telegram
[Auth] Authentication successful
```

Если видите ошибки, они укажут на проблему.

### 2. Проверка на Backend

```bash
# На VM смотрите логи
cd /opt/makemefit/infra
docker-compose logs -f backend | grep -i auth
```

Ожидаемые логи при успешной авторизации:
```
[Auth] Received auth request, init_data length: 1234
[Auth] Success: User 123456789 authenticated
```

### 3. Проверка переменных окружения

```bash
# На VM
cd /opt/makemefit
cat backend/.env | grep TELEGRAM

# Должно быть:
# TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
# TELEGRAM_BOT_USERNAME=your_bot_username
```

### 4. Тест валидации initData

Если нужно протестировать валидацию вручную:

```python
# В Python shell на VM
from app.auth import validate_telegram_init_data

# Получите initData из браузера (в DevTools: WebApp.initData)
init_data = "ваш_initData_здесь"
result = validate_telegram_init_data(init_data)
print(result)
```

## Частые ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| "init_data is required" | initData не передается | Откройте из Telegram, не из браузера |
| "Hash mismatch" | Неправильный токен бота | Проверьте TELEGRAM_BOT_TOKEN в .env |
| "auth_date is too old" | initData истек | Перезагрузите приложение |
| "Missing user ID" | initData не содержит user | Проверьте, что бот настроен правильно |
| "Cannot connect to server" | Backend недоступен | Проверьте статус контейнеров |

## Быстрая проверка

1. **Откройте приложение из Telegram** (не из браузера!)
2. **Проверьте консоль браузера** (F12 → Console)
3. **Проверьте логи backend** на VM
4. **Проверьте .env файл** - токен должен быть правильным

## Если ничего не помогает

1. Перезапустите все контейнеры:
   ```bash
   cd /opt/makemefit/infra
   docker-compose restart
   ```

2. Проверьте, что домен Mini App в @BotFather совпадает с app.example.com

3. Убедитесь, что используется HTTPS (Telegram требует HTTPS для Mini Apps)

4. Проверьте, что бот активен и токен не отозван
