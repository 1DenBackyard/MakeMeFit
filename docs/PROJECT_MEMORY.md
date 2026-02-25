# MakeMeFit - Полная документация проекта

## 📋 Общее описание

**MakeMeFit** - Production-ready Telegram Mini App MVP для AI-рекомендаций по добавкам и тренировкам.

### Основные функции
- Два трека: **Supplements** (добавки) и **Workouts** (тренировки)
- AI-генерация персонализированных рекомендаций
- Демо-режим (1 бесплатный запрос на трек)
- Полный план с PDF после оплаты
- История запросов
- Реферальная система для тренеров

---

## 🌐 Домен и деплой

### Домены
- **Основной домен**: amesin.ru
- **API**: api.amesin.ru (backend на порту 8000)
- **Frontend**: app.amesin.ru (frontend на порту 5173)

### Инфраструктура
- **VM**: /opt/makemefit
- **Деплой**: Автоматический через GitHub Actions при push в main
- **Reverse Proxy**: Nginx с SSL (Let's Encrypt)
- **Database**: PostgreSQL 15 в Docker

### Важные директории на VM
```
/opt/makemefit/              # Корень проекта
├── backend/.env            # Секреты (сохраняются при обновлении!)
├── infra/                   # docker-compose
/etc/nginx/sites-available/makemefit  # Конфигурация Nginx
/etc/letsencrypt/live/       # SSL сертификаты
```

---

## 🏗️ Архитектура

### Backend (FastAPI)
- **Язык**: Python 3.11+
- **Фреймворк**: FastAPI (async)
- **База данных**: PostgreSQL 15 (async SQLAlchemy)
- **ORM**: SQLAlchemy 2.0+ (async)
- **Миграции**: Alembic
- **Аутентификация**: JWT токены, Telegram initData validation
- **Rate Limiting**: aiolimiter (на уровне пользователя)
- **PDF Generation**: reportlab + markdown

### Frontend (React + TypeScript)
- **Фреймворк**: React 18.3.0
- **Язык**: TypeScript 5.7.0
- **Сборщик**: Vite 6.0.0
- **Telegram SDK**: @twa-dev/sdk 7.0.0
- **Стили**: Inline styles + дизайн-система (theme.ts)

### Database (PostgreSQL)
- **Версия**: PostgreSQL 15
- **Драйвер**: asyncpg
- **Подключение**: `postgresql+asyncpg://makemefit:makemefit@postgres:5432/makemefit`

---

## 📁 Структура проекта

```
MakeMeFit/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── routers/           # API endpoints
│   │   │   ├── auth.py        # Telegram authentication
│   │   │   ├── requests.py    # Создание запросов, demo, full answer
│   │   │   ├── payments.py    # Платежи (Telegram Payments)
│   │   │   ├── trainers.py   # Реферальная система тренеров
│   │   │   ├── admin.py       # Админ-панель
│   │   │   └── streaming.py   # SSE streaming для AI ответов
│   │   ├── models.py          # SQLAlchemy модели (User, Request, Payment, etc.)
│   │   ├── schemas.py         # Pydantic схемы
│   │   ├── auth.py            # Telegram initData validation, JWT
│   │   ├── llm.py             # LLM provider abstraction (OpenAI-compatible)
│   │   ├── anti_fraud.py      # 2-stage anti-fraud pipeline
│   │   ├── pdf_generator.py   # Генерация PDF из markdown
│   │   ├── config.py          # Настройки (Pydantic Settings)
│   │   ├── database.py        # Database connection, session
│   │   ├── dependencies.py    # FastAPI dependencies (get_current_user)
│   │   └── main.py            # FastAPI app, middleware, routers
│   ├── prompts/               # LLM prompt templates
│   │   ├── anti_fraud.txt
│   │   ├── supplements_demo.txt
│   │   ├── supplements_full.txt
│   │   ├── workouts_demo.txt
│   │   └── workouts_full.txt
│   ├── alembic/               # Database migrations
│   ├── scripts/                # Utility scripts
│   ├── Dockerfile              # Backend container
│   ├── requirements.txt        # Python зависимости
│   └── .env                    # Секреты (НЕ в git!)
│
├── frontend/                   # React + TypeScript Mini App
│   ├── src/
│   │   ├── ui/
│   │   │   └── App.tsx         # Главный компонент (state management, routing)
│   │   ├── components/         # React компоненты
│   │   │   ├── TrackSelection.tsx    # Выбор трека (Supplements/Workouts)
│   │   │   ├── SupplementsForm.tsx    # Форма для добавок
│   │   │   ├── WorkoutsForm.tsx       # Форма для тренировок
│   │   │   ├── DemoAnswer.tsx         # Отображение demo ответа + paywall
│   │   │   └── FullAnswer.tsx         # Полный ответ + PDF + trainer referral
│   │   ├── api/                # API client
│   │   │   ├── client.ts       # HTTP client, token management
│   │   │   ├── auth.ts         # Telegram authentication
│   │   │   └── requests.ts     # Requests API (create, demo, full, history)
│   │   ├── hooks/
│   │   │   └── useTelegram.ts  # Хук для Telegram WebApp SDK
│   │   ├── styles/
│   │   │   └── theme.ts        # Дизайн-система (colors, typography, spacing)
│   │   └── main.tsx            # Entry point
│   ├── Dockerfile              # Frontend container (multi-stage: build + nginx)
│   ├── package.json            # NPM зависимости
│   ├── vite.config.ts          # Vite конфигурация
│   └── tsconfig.json           # TypeScript конфигурация
│
├── infra/
│   └── docker-compose.yml      # Docker Compose конфигурация
│
├── scripts/
│   ├── update_vm.sh            # Быстрое обновление на VM (одна команда!)
│   ├── sync_from_repo.sh       # Синхронизация из git с сохранением .env
│   ├── create-env.sh           # Создание .env файлов
│   └── README-ENV.md           # Шаблоны .env файлов
│
├── docs/                       # Документация
│   ├── VM_SETUP_FROM_SCRATCH.md    # Настройка VM с нуля
│   ├── QUICK_UPDATE.md             # Быстрое обновление
│   ├── TELEGRAM_SETUP.md           # Настройка Telegram бота
│   ├── ENV_SETUP.md                # Переменные окружения
│   ├── TROUBLESHOOTING.md          # Решение проблем
│   └── PROJECT_MEMORY.md           # Этот файл
│
└── README.md                   # Основной README
```

---

## 🔌 API Endpoints

### Authentication (`/auth`)
- `POST /auth/telegram` - Аутентификация через Telegram initData
  - Возвращает: `{ token: string, user: UserResponse }`
  - Валидирует Telegram initData, создает/обновляет пользователя, возвращает JWT

### Requests (`/requests`)
- `POST /requests/` - Создать новый запрос
  - Требует: `{ track: 'supplements' | 'workouts', form_data: Record<string, unknown> }`
  - Проходит через anti-fraud (2-stage), создает запрос, генерирует demo ответ
  - Возвращает: `RequestResponse`
  
- `GET /requests/{id}/demo` - Получить demo ответ
  - Возвращает: `{ request_id, demo_answer, requires_payment, message }`
  - Проверяет лимит: 1 demo per track per user
  
- `POST /requests/{id}/full` - Генерировать полный ответ
  - Требует оплаты (проверяется через Payment)
  - Генерирует полный ответ + PDF
  - Возвращает: `{ request_id, full_answer, pdf_url, pdf_size_bytes }`
  
- `GET /requests/` - История запросов пользователя
  - Возвращает: `RequestResponse[]`

### Payments (`/payments`)
- `POST /payments/` - Создать платеж
- `POST /payments/{id}/complete` - Завершить платеж (Telegram Payments)

### Trainers (`/trainers`)
- `POST /trainers/match` - Найти тренера (реферальная система)

### Admin (`/admin`)
- `GET /admin/leads` - Все лиды (требует admin_secret)
- `GET /admin/stats` - Статистика (требует admin_secret)

### Streaming (`/streaming`)
- `GET /streaming/{request_id}` - SSE stream для real-time AI ответов

### Health & Files
- `GET /health` - Health check
- `GET /api/files/{filename}` - Скачать PDF файл

---

## 🎯 Бизнес-логика

### User Flow
1. **Telegram Auth** → Пользователь открывает Mini App, отправляется initData
2. **Track Selection** → Выбор между Supplements и Workouts
3. **Form** → Заполнение формы (цели, параметры, ограничения)
4. **Anti-fraud** → 2-stage проверка:
   - Stage 1: Rule-based (быстрая проверка)
   - Stage 2: Structured validation (LLM проверка)
5. **Demo Answer** → Генерация демо-ответа (маленькая модель)
6. **Paywall** → Сообщение о необходимости оплаты
7. **Payment** → Telegram Payments (пропущено для теста)
8. **Full Answer** → Генерация полного ответа (большая модель) + PDF
9. **History** → Просмотр истории запросов
10. **Trainer Referral** → Реферальная система для тренеров

### User Limits
- **1 demo per track** - каждый пользователь может получить 1 бесплатный demo на каждый трек
- После demo требуется оплата для полного ответа
- Лимит отслеживается через таблицу `DemoUsage`

### Anti-fraud Pipeline
1. **Stage 1 (Rule-based)**:
   - Проверка обязательных полей
   - Валидация типов данных
   - Проверка разумности значений
   
2. **Stage 2 (Structured validation)**:
   - Использует маленькую LLM модель
   - Проверяет структурированность данных
   - Извлекает контекст для дальнейшей генерации

### Token Efficiency
- **Demo**: Использует маленькую модель (быстро, дешево)
- **Full Answer**: Использует большую модель (качественно, дороже)
- Промпты оптимизированы для минимизации токенов

---

## 🔧 Технические детали

### Backend

#### Зависимости (requirements.txt)
```
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
sqlalchemy>=2.0.0
asyncpg>=0.30.0
alembic>=1.13.0
python-dotenv>=1.0.1
pydantic-settings>=2.7.0
httpx>=0.27.0
pyjwt>=2.9.0
passlib>=1.7.4
reportlab>=4.2.0
markdown>=3.6
aiolimiter>=1.1.0
python-multipart>=0.0.9
```

#### Database Models
- **User**: telegram_id, username, first_name, last_name, language_code, created_at
- **Request**: user_id, track, status, form_data, structured_context, anti_fraud_passed, demo_answer, full_answer, created_at
- **DemoUsage**: user_id, track, request_id, used_at (отслеживание лимитов)
- **Payment**: user_id, request_id, amount, status, telegram_payment_charge_id
- **Lead**: user_id, request_id, trainer_referral_code, status (реферальная система)
- **FullAnswer**: request_id, pdf_filename, pdf_size_bytes

#### LLM Provider Abstraction
- Работает с любым OpenAI-совместимым API
- Настройка через `LLM_BASE_URL` и `LLM_API_KEY`
- Автоматическое определение провайдера
- Поддержка streaming (SSE)

#### Security
- **Telegram initData validation**: Проверка подписи через HMAC-SHA-256
- **JWT tokens**: Для аутентификации API запросов
- **Rate limiting**: На уровне пользователя (aiolimiter)
- **CORS**: Настроен для Telegram доменов

### Frontend

#### Зависимости (package.json)
```json
{
  "dependencies": {
    "@twa-dev/sdk": "^7.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.7.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

#### State Management
- Использует React hooks (useState, useEffect)
- State в App.tsx:
  - `state`: AppState (loading, auth, track_selection, form, demo, full_answer, error)
  - `selectedTrack`: TrackType | null
  - `currentRequest`: RequestResponse | null
  - `demoResponse`: DemoResponse | null
  - `fullAnswer`: { full_answer: string, pdf_url?: string } | null

#### API Client
- Централизованный клиент в `src/api/client.ts`
- Управление токенами (localStorage)
- Автоматическое добавление Authorization header
- Обработка ошибок

#### Telegram Integration
- Хук `useTelegram()` для работы с Telegram WebApp SDK
- Автоматическая инициализация при загрузке
- Расширение приложения, настройка темы
- Использование WebApp.MainButton для прогресса

#### Дизайн-система
- Централизованная тема в `src/styles/theme.ts`
- Цвета, типографика, spacing, border-radius, transitions, shadows
- Inline styles для всех компонентов

---

## 🚀 Деплой и обновление

### Быстрое обновление на VM

**Одна команда:**
```bash
cd /opt/makemefit && ./scripts/update_vm.sh
```

**Что делает скрипт:**
1. Сохраняет `backend/.env` в `/tmp/backend.env.bak`
2. Обновляет код: `git fetch origin && git reset --hard origin/main`
3. Восстанавливает `backend/.env` из бэкапа
4. Останавливает контейнеры: `docker-compose down`
5. Пересобирает без кэша: `docker-compose build --no-cache`
6. Запускает: `docker-compose up -d`
7. Показывает статус: `docker-compose ps`

### Docker Compose Services

#### postgres
- Образ: `postgres:15`
- Порт: `5432:5432`
- Volume: `postgres_data`
- Healthcheck: `pg_isready`

#### backend
- Build: `backend/Dockerfile`
- Порт: `8000:8000`
- Env file: `backend/.env`
- Volume: `../backend:/app` (для hot reload)
- Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`
- Healthcheck: `curl http://localhost:8000/health`

#### frontend
- Build: `frontend/Dockerfile` (multi-stage: node build + nginx)
- Порт: `5173:80`
- Environment: `VITE_API_URL` (опционально)
- Volume: `../frontend:/app` (для разработки)

---

## ⚙️ Конфигурация

### Backend Environment Variables (.env)

#### Обязательные
- `TELEGRAM_BOT_TOKEN` - Токен от @BotFather
- `TELEGRAM_BOT_USERNAME` - Username бота без @
- `LLM_API_KEY` - API ключ для LLM провайдера
- `LLM_BASE_URL` - URL endpoint (например, `https://foundation-models.api.cloud.ru/v1`)
- `SECRET_KEY` - Случайная строка минимум 32 символа (для JWT)

#### Опциональные
- `DATABASE_URL` - Переопределение URL БД (по умолчанию из docker-compose)
- `PAYMENT_PROVIDER_TOKEN` - Токен для Telegram Payments (можно оставить пустым)
- `ADMIN_SECRET` - Секрет для админ-панели
- `RATE_LIMIT_PER_MINUTE` - Лимит запросов в минуту (по умолчанию 60)
- `PDF_STORAGE_PATH` - Путь для хранения PDF (по умолчанию `/app/pdfs`)
- `DEBUG` - Режим отладки (по умолчанию False)

### Frontend Environment Variables

#### Опциональные
- `VITE_API_URL` - URL backend API (по умолчанию `http://localhost:8000`)
  - В production обычно: `https://api.amesin.ru`

---

## 📊 Database Schema

### Основные таблицы

#### users
- `id` (PK, serial)
- `telegram_id` (bigint, unique)
- `username` (string, nullable)
- `first_name` (string, nullable)
- `last_name` (string, nullable)
- `language_code` (string, nullable)
- `created_at` (timestamp)

#### requests
- `id` (PK, serial)
- `user_id` (FK → users.id)
- `track` (enum: 'supplements' | 'workouts')
- `status` (enum: PENDING, PROCESSING, COMPLETED, REJECTED)
- `form_data` (JSONB)
- `structured_context` (JSONB, nullable)
- `anti_fraud_passed` (boolean)
- `anti_fraud_reason` (text, nullable)
- `demo_answer` (text, nullable)
- `full_answer` (text, nullable)
- `suggested_activity_type` (string, nullable)
- `created_at` (timestamp)

#### demo_usage
- `id` (PK, serial)
- `user_id` (FK → users.id)
- `track` (enum: 'supplements' | 'workouts')
- `request_id` (FK → requests.id)
- `used_at` (timestamp)

#### payments
- `id` (PK, serial)
- `user_id` (FK → users.id)
- `request_id` (FK → requests.id)
- `amount` (decimal)
- `status` (enum: PENDING, COMPLETED, FAILED)
- `telegram_payment_charge_id` (string, nullable)
- `created_at` (timestamp)

#### leads (для реферальной системы)
- `id` (PK, serial)
- `user_id` (FK → users.id)
- `request_id` (FK → requests.id)
- `trainer_referral_code` (string, nullable)
- `status` (enum: PENDING, CONTACTED, CONVERTED)
- `created_at` (timestamp)

#### full_answers
- `id` (PK, serial)
- `request_id` (FK → requests.id, unique)
- `pdf_filename` (string)
- `pdf_size_bytes` (bigint)
- `created_at` (timestamp)

---

## 🔄 Workflow запроса

### 1. Создание запроса (POST /requests/)
```
User → Frontend → Backend
  ↓
1. Проверка demo лимита (DemoUsage)
2. Stage 1 anti-fraud (rule-based)
3. Stage 2 anti-fraud (LLM validation)
4. Создание Request в БД
5. Генерация demo ответа (маленькая модель)
6. Сохранение demo_answer в Request
7. Создание записи DemoUsage
8. Возврат RequestResponse
```

### 2. Получение demo (GET /requests/{id}/demo)
```
User → Frontend → Backend
  ↓
1. Проверка существования Request
2. Проверка demo лимита (если еще не использован)
3. Возврат DemoResponse с demo_answer
```

### 3. Генерация полного ответа (POST /requests/{id}/full)
```
User → Frontend → Backend
  ↓
1. Проверка существования Request
2. Проверка оплаты (Payment.status == COMPLETED)
3. Генерация полного ответа (большая модель)
4. Генерация PDF из markdown
5. Сохранение PDF в файловую систему
6. Создание записи FullAnswer
7. Обновление Request.full_answer
8. Возврат FullAnswerResponse с pdf_url
```

---

## 🛠️ Команды

### На VM

#### Быстрое обновление (рекомендуется)
```bash
cd /opt/makemefit && ./scripts/update_vm.sh
```

#### Ручное обновление
```bash
cd /opt/makemefit
cp backend/.env /tmp/backend.env.bak
git fetch origin
git reset --hard origin/main
cp /tmp/backend.env.bak backend/.env
rm /tmp/backend.env.bak
cd infra
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Проверка статуса
```bash
cd /opt/makemefit/infra
docker-compose ps
docker-compose logs -f
curl http://localhost:8000/health
```

### Локально

#### Запуск через Docker Compose
```bash
cd infra
docker-compose up -d
```

#### Локальный запуск backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

---

## 📝 Важные замечания

### LLM Provider
- **Название провайдера не играет роли** - система работает с любым OpenAI-совместимым API
- Если указан `LLM_BASE_URL`, система автоматически использует его
- Пример: `LLM_BASE_URL=https://foundation-models.api.cloud.ru/v1`

### Security
- `.env` файлы **НЕ должны быть в git**
- Скрипт `update_vm.sh` автоматически сохраняет и восстанавливает `.env`
- Telegram initData валидируется на каждом запросе auth

### Stateless Architecture
- Все состояние хранится в БД
- Backend полностью stateless
- Можно масштабировать горизонтально

### Frontend
- Использует `default export` для App компонента
- Все компоненты используют inline styles + theme
- API клиент централизован в `src/api/client.ts`
- Token хранится в localStorage

---

## 🔗 Полезные ссылки

### Документация
- [Настройка VM с нуля](VM_SETUP_FROM_SCRATCH.md)
- [Быстрое обновление](QUICK_UPDATE.md)
- [Настройка Telegram](TELEGRAM_SETUP.md)
- [Настройка окружения](ENV_SETUP.md)
- [Решение проблем](TROUBLESHOOTING.md)

### Внешние ресурсы
- Telegram Mini Apps: https://core.telegram.org/bots/webapps
- Telegram WebApp SDK: https://github.com/twa-dev/sdk
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev

---

**Последнее обновление**: 2026-02-25
**Версия**: 0.1.0
