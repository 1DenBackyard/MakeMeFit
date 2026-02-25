# Настройка окружения и локальное тестирование

## Переменные окружения

### Backend (.env файл в `backend/`)

```env
# App
APP_NAME=MakeMeFit API
APP_VERSION=0.1.0
DEBUG=false

# Database
DATABASE_URL=postgresql+asyncpg://makemefit:makemefit@localhost:5432/makemefit

# Telegram
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_BOT_USERNAME=your_bot_username

# LLM Provider (OpenAI-compatible)
LLM_PROVIDER=openai
LLM_API_KEY=your_api_key
LLM_BASE_URL=https://foundation-models.api.cloud.ru/v1
LLM_MODEL=openai/gpt-oss-120b
LLM_MODEL_FULL=openai/gpt-oss-120b
LLM_STREAMING=true

# Примечание: Название провайдера (LLM_PROVIDER) не играет роли.
# Если указан LLM_BASE_URL, система автоматически использует его.
# Работает с любым OpenAI-совместимым API.

# Payments
PAYMENT_PROVIDER_TOKEN=your_telegram_payment_provider_token

# Security
SECRET_KEY=your_secret_key_for_jwt_min_32_chars
RATE_LIMIT_PER_MINUTE=10

# Admin
ADMIN_SECRET=your_admin_secret

# PDF Storage
PDF_STORAGE_PATH=/tmp/pdfs
```

### Frontend (.env файл в `frontend/`)

```env
VITE_API_URL=http://localhost:8000
```

## Локальный запуск

### 1. Установка зависимостей

#### Backend
```bash
cd backend
poetry install
# или
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### 2. Запуск PostgreSQL

```bash
# Через Docker
docker run -d \
  --name makemefit-postgres \
  -e POSTGRES_USER=makemefit \
  -e POSTGRES_PASSWORD=makemefit \
  -e POSTGRES_DB=makemefit \
  -p 5432:5432 \
  postgres:15

# Или через docker-compose
cd infra
docker-compose up -d postgres
```

### 3. Настройка базы данных

```bash
cd backend

# Создать миграции
alembic revision --autogenerate -m "Initial migration"

# Применить миграции
alembic upgrade head

# Заполнить начальными данными
python scripts/seed.py
```

### 4. Запуск Backend

```bash
cd backend

# Создать .env файл с переменными выше
cp .env.example .env
# Отредактировать .env

# Запустить
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Запуск Frontend

```bash
cd frontend

# Создать .env файл
echo "VITE_API_URL=http://localhost:8000" > .env

# Запустить dev server
npm run dev
```

### 6. Полный запуск через Docker Compose

```bash
cd infra
docker-compose up -d
```

## Тестирование

### Health Check
```bash
curl http://localhost:8000/health
```

### Авторизация через Telegram
```bash
# Получить initData из Telegram WebApp SDK
curl -X POST http://localhost:8000/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"init_data": "your_telegram_init_data"}'
```

## CI/CD

### GitHub Actions пример

Создайте `.github/workflows/ci.yml`:

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install poetry
          poetry install
      
      - name: Run tests
        run: |
          cd backend
          poetry run pytest
        env:
          DATABASE_URL: postgresql+asyncpg://test:test@localhost:5432/test
          SECRET_KEY: test_secret_key_min_32_chars_long
          TELEGRAM_BOT_TOKEN: test_token
          TELEGRAM_BOT_USERNAME: test_bot
          LLM_API_KEY: test_key
          PAYMENT_PROVIDER_TOKEN: test_token
  
  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t makemefit-backend:latest ./backend
          docker build -t makemefit-frontend:latest ./frontend
      
      - name: Push to registry
        if: github.ref == 'refs/heads/main'
        run: |
          echo "Push to container registry"
          # Добавьте команды для push в ваш registry
```

### Версионирование

Используйте Semantic Versioning:
- `MAJOR.MINOR.PATCH` (например, `1.0.0`)
- Обновляйте версию в:
  - `backend/pyproject.toml`
  - `frontend/package.json`
  - `backend/app/config.py`

### Деплой в Azure Container Apps

1. Создайте Container Registry (ACR)
2. Соберите и запушьте образы:
```bash
az acr build --registry <registry-name> --image makemefit-backend:latest ./backend
az acr build --registry <registry-name> --image makemefit-frontend:latest ./frontend
```

3. Создайте Container App:
```bash
az containerapp create \
  --name makemefit-backend \
  --resource-group <resource-group> \
  --image <registry>/makemefit-backend:latest \
  --env-vars $(cat backend/.env | grep -v '^#' | xargs)
```

4. Настройте переменные окружения через Azure Portal или CLI

## Troubleshooting

### Проблемы с подключением к БД
- Проверьте, что PostgreSQL запущен: `docker ps`
- Проверьте `DATABASE_URL` в `.env`
- Проверьте доступность порта: `telnet localhost 5432`

### Проблемы с LLM API
- Проверьте `LLM_API_KEY` и `LLM_BASE_URL`
- Убедитесь, что endpoint доступен
- Проверьте логи: `docker logs <container-name>`

### Проблемы с Telegram
- Убедитесь, что бот создан через @BotFather
- Проверьте `TELEGRAM_BOT_TOKEN`
- Для локального тестирования используйте ngrok для туннеля
