# MakeMeFit Telegram Mini App MVP

Production-ready MVP Telegram Mini App that provides AI-powered recommendations for two tracks:
- Supplements
- Workouts

## Быстрый старт

1. **Создайте .env файлы:**
   ```bash
   ./scripts/create-env.sh
   ```
   Или создайте вручную (см. `scripts/README-ENV.md`)

2. **Заполните обязательные значения в `backend/.env`:**
   - `TELEGRAM_BOT_TOKEN` - токен от @BotFather (обязательно! Mini App работает через бота)
   - `TELEGRAM_BOT_USERNAME` - username бота без @
   - `LLM_API_KEY` - API ключ для LLM
   - `LLM_BASE_URL` - URL endpoint (например, `https://foundation-models.api.cloud.ru/v1`)
   - `SECRET_KEY` - случайная строка минимум 32 символа (сгенерируйте: `openssl rand -hex 32`)
   - `PAYMENT_PROVIDER_TOKEN` - можно оставить пустым для теста
   
   📖 **Подробная инструкция**: [docs/TELEGRAM_SETUP.md](docs/TELEGRAM_SETUP.md)

3. **Запустите через Docker Compose:**
   ```bash
   cd infra
   docker-compose up -d
   ```

## Структура проекта

- `frontend/`: React + TypeScript Telegram Mini App
- `backend/`: FastAPI, async, Postgres, LLM abstraction, PDF generation
- `infra/`: Docker, docker-compose, Container Apps deployment helpers
- `docs/`: Документация (архитектура, деплой, настройка окружения)

## Важно про LLM провайдер

- **Название провайдера не играет роли** - система работает с любым OpenAI-совместимым API
- Если указан `LLM_BASE_URL`, система автоматически использует его
- Просто укажите ваш endpoint в `LLM_BASE_URL` и API ключ в `LLM_API_KEY`

## Быстрое обновление на VM

**Одна команда для обновления:**
```bash
cd /opt/makemefit && ./scripts/update_vm.sh
```

Эта команда автоматически обновляет код, сохраняет .env файлы, пересобирает и перезапускает контейнеры.

📖 **Подробнее**: [docs/QUICK_UPDATE.md](docs/QUICK_UPDATE.md)

## Документация

### Деплой
- **[Настройка VM с нуля](docs/VM_SETUP_FROM_SCRATCH.md)** - полная инструкция для новой VM 🚀
- **[Быстрое обновление](docs/QUICK_UPDATE.md)** - одна команда для обновления на VM
- [Исправление SSL ошибок Nginx](docs/NGINX_SSL_FIX.md) - если видите ошибку "cannot load certificate"

### Настройка
- [Настройка Telegram Mini App](docs/TELEGRAM_SETUP.md) - создание бота, настройка Mini App
- [Настройка окружения](docs/ENV_SETUP.md) - переменные окружения
- [Создание .env файлов](scripts/README-ENV.md) - шаблоны и примеры
- [Настройка Python окружения](docs/SETUP_PYTHON.md) - venv, Poetry, зависимости
- [Настройка Python БЕЗ Homebrew](docs/SETUP_PYTHON_NO_BREW.md) - альтернативные способы установки

### Архитектура
- [Архитектура](docs/README.md)

### Troubleshooting
- [Решение проблем](docs/TROUBLESHOOTING.md) - частые ошибки и их решения
