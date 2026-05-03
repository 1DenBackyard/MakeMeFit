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
- **Полностью русифицированный интерфейс**

---

## 🌐 Домен и деплой

### Домены
- **Основной домен**: example.com
- **API**: api.example.com (backend на порту 8000)
- **Frontend**: app.example.com (frontend на порту 5173)

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
- **Аутентификация**: **ОТКЛЮЧЕНА** - используется mock user автоматически
- **Rate Limiting**: aiolimiter (на уровне пользователя)
- **PDF Generation**: reportlab + markdown
- **LLM**: OpenAI-compatible API (настраивается через LLM_BASE_URL)

### Frontend (React + TypeScript)
- **Фреймворк**: React 18.3.0
- **Язык**: TypeScript 5.7.0
- **Сборщик**: Vite 6.0.0
- **Telegram SDK**: @twa-dev/sdk 7.0.0
- **Стили**: **TailwindCSS** + UI компоненты (Screen, Card, Button, Input, Select, TextArea, Chip, Badge, Loader, Toast, Divider)
- **State Management**: useReducer (state machine)
- **Язык интерфейса**: **Русский** (полностью русифицирован)

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
│   │   │   ├── auth.py        # Telegram authentication + /auth/dev/mock
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
│   │   ├── dependencies.py    # FastAPI dependencies (get_current_user - опциональный, использует mock user)
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
│   │   │   └── App.tsx         # Главный компонент (state machine, routing)
│   │   ├── components/         # React компоненты
│   │   │   ├── TrackSelection.tsx    # Выбор трека (Supplements/Workouts)
│   │   │   ├── SupplementsForm.tsx    # Форма для добавок (русифицирована)
│   │   │   ├── WorkoutsForm.tsx       # Форма для тренировок (русифицирована)
│   │   │   ├── DemoAnswer.tsx         # Отображение demo ответа + paywall
│   │   │   ├── FullAnswer.tsx         # Полный ответ + PDF + trainer referral
│   │   │   ├── HistoryScreen.tsx      # История запросов
│   │   │   ├── TrainerReferral.tsx    # Реферальная система
│   │   │   └── ui/                    # UI примитивы (TailwindCSS)
│   │   │       ├── Screen.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Button.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Select.tsx
│   │   │       ├── TextArea.tsx
│   │   │       ├── Chip.tsx
│   │   │       ├── Badge.tsx
│   │   │       ├── Loader.tsx
│   │   │       ├── Toast.tsx
│   │   │       └── Divider.tsx
│   │   ├── api/                # API client
│   │   │   ├── client.ts       # HTTP client (без токена - backend использует mock user)
│   │   │   ├── auth.ts         # Telegram authentication (не используется)
│   │   │   ├── requests.ts     # Requests API (create, demo, full, history)
│   │   │   └── trainers.ts     # Trainers API
│   │   ├── hooks/
│   │   │   └── useTelegram.ts  # Хук для Telegram WebApp SDK
│   │   ├── state/
│   │   │   └── appState.ts     # State machine (AppState, AppAction, appReducer)
│   │   ├── utils/
│   │   │   ├── formData.ts     # Нормализация данных формы
│   │   │   └── markdown.ts     # Рендеринг markdown
│   │   └── main.tsx            # Entry point
│   ├── Dockerfile              # Frontend container (multi-stage: build + nginx)
│   ├── package.json            # NPM зависимости
│   ├── vite.config.ts          # Vite конфигурация
│   ├── tailwind.config.js      # TailwindCSS конфигурация
│   ├── postcss.config.js       # PostCSS конфигурация
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
│   ├── AUTH_TROUBLESHOOTING.md     # Решение проблем с аутентификацией
│   ├── INITDATA_FIX.md             # Исправление проблемы с initData
│   └── ARCHITECTURE.md           # Этот файл
│
└── README.md                   # Основной README
```

---

## 🔌 API Endpoints

### Authentication (`/auth`)
- `POST /auth/telegram` - Аутентификация через Telegram initData (не используется)
  - Возвращает: `{ token: string, user: UserResponse }`
  - Валидирует Telegram initData, создает/обновляет пользователя, возвращает JWT

- `POST /auth/dev/mock` - **DEV ONLY**: Создать/получить mock user и вернуть токен
  - Не требует аутентификации
  - Возвращает: `{ token: string, user: UserResponse }`
  - Использует фиксированный telegram_id = 123456789

**ВАЖНО**: Аутентификация отключена. Backend автоматически использует mock user, если токен не предоставлен.

### Requests (`/requests`)
- `POST /requests/` - Создать новый запрос
  - Требует: `{ track: 'supplements' | 'workouts', form_data: Record<string, unknown> }`
  - Проходит через anti-fraud (2-stage), создает запрос, генерирует demo ответ
  - Возвращает: `RequestResponse`
  - **Не требует токена** - использует mock user автоматически
  
- `GET /requests/{id}/demo` - Получить demo ответ
  - Возвращает: `{ request_id, demo_answer, requires_payment, message }`
  - Проверяет лимит: 1 demo per track per user
  - **Не требует токена**
  
- `POST /requests/{id}/full` - Генерировать полный ответ
  - Требует оплаты (проверяется через Payment)
  - Генерирует полный ответ + PDF
  - Возвращает: `{ request_id, full_answer, pdf_url, pdf_size_bytes }`
  - **Не требует токена**
  
- `GET /requests/` - История запросов пользователя
  - Возвращает: `RequestResponse[]`
  - **Не требует токена**

### Payments (`/payments`)
- `POST /payments/` - Создать платеж
- `POST /payments/{id}/complete` - Завершить платеж (Telegram Payments)

### Trainers (`/trainers`)
- `POST /trainers/match` - Найти тренера (реферальная система)
- `POST /trainers/leads` - Создать lead

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
1. **App Load** → Приложение загружается, сразу переходит к выбору трека (auth отключена)
2. **Track Selection** → Выбор между Supplements и Workouts
3. **Form** → Заполнение формы (цели, параметры, ограничения) - **полностью русифицировано**
4. **Anti-fraud** → 2-stage проверка:
   - Stage 1: Rule-based (быстрая проверка)
   - Stage 2: Structured validation (LLM проверка)
5. **Demo Answer** → Генерация демо-ответа (маленькая модель)
6. **Paywall** → Сообщение о необходимости оплаты (если лимит достигнут)
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
- **Аутентификация ОТКЛЮЧЕНА**: Все endpoints используют mock user автоматически
- **get_current_user**: Опциональный dependency - если токена нет, возвращает mock user (telegram_id = 123456789)
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
    "vite": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

#### State Management
- **State Machine**: Использует `useReducer` с `appReducer`
- **AppState**: loading, auth, track_selection, form, demo, paywall, full_answer, history, trainer_referral, error
- **AppAction**: AUTH_START, AUTH_SUCCESS, AUTH_ERROR, SELECT_TRACK, SUBMIT_FORM_START, SUBMIT_FORM_SUCCESS, SUBMIT_FORM_ERROR, UNLOCK_START, UNLOCK_SUCCESS, UNLOCK_ERROR, SHOW_PAYWALL, SHOW_HISTORY, SHOW_TRAINER_REFERRAL, GO_BACK, RESET

#### API Client
- Централизованный клиент в `src/api/client.ts`
- **НЕ отправляет токен** - backend использует mock user автоматически
- Автоматическая обработка ошибок
- Логирование всех запросов в консоль

#### Telegram Integration
- Хук `useTelegram()` для работы с Telegram WebApp SDK
- Автоматическая инициализация при загрузке
- Расширение приложения, настройка темы
- Использование WebApp.MainButton для прогресса
- **Аутентификация отключена** - приложение сразу переходит к track_selection

#### UI System
- **TailwindCSS**: Основная система стилей
- **UI Primitives**: Переиспользуемые компоненты
  - Screen: Контейнер экрана с header/footer
  - Card: Карточка с hover эффектами
  - Button: Кнопка с вариантами (primary, secondary, outline, ghost)
  - Input: Текстовое поле с валидацией
  - Select: Выпадающий список
  - TextArea: Многострочное поле
  - Chip: Чип для выбора (используется в формах)
  - Badge: Бейдж для статусов
  - Loader: Индикатор загрузки
  - Toast: Уведомления
  - Divider: Разделитель

#### Интерфейс
- **Полностью русифицирован**: Все тексты, сообщения, кнопки, заголовки на русском языке
- Формы (SupplementsForm, WorkoutsForm) полностью на русском
- Сообщения об ошибках на русском
- Все компоненты русифицированы

#### Form Data Normalization
- `normalizeFormData()`: Преобразует данные формы в формат backend
- `normalizeSupplementsForm()`: Нормализация для добавок
- `normalizeWorkoutsForm()`: Нормализация для тренировок
- Обрабатывает "Нет" в массивах (фильтрует из данных)

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
- `TELEGRAM_BOT_TOKEN` - Токен от @BotFather (не используется, но должен быть)
- `TELEGRAM_BOT_USERNAME` - Username бота без @ (не используется)
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
- `LLM_MODEL` - Модель для demo (по умолчанию `gpt-4o-mini`)
- `LLM_MODEL_FULL` - Модель для full answer (по умолчанию `gpt-4o`)

### Frontend Environment Variables

#### Опциональные
- `VITE_API_URL` - URL backend API (по умолчанию `http://localhost:8000`)
  - В production обычно: `https://api.example.com`

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
1. Backend автоматически использует mock user (если токена нет)
2. Проверка demo лимита (DemoUsage)
3. Stage 1 anti-fraud (rule-based)
4. Stage 2 anti-fraud (LLM validation)
5. Создание Request в БД
6. Генерация demo ответа (маленькая модель)
7. Сохранение demo_answer в Request
8. Создание записи DemoUsage
9. Возврат RequestResponse
```

### 2. Получение demo (GET /requests/{id}/demo)
```
User → Frontend → Backend
  ↓
1. Backend автоматически использует mock user
2. Проверка существования Request
3. Проверка demo лимита (если еще не использован)
4. Возврат DemoResponse с demo_answer
```

### 3. Генерация полного ответа (POST /requests/{id}/full)
```
User → Frontend → Backend
  ↓
1. Backend автоматически использует mock user
2. Проверка существования Request
3. Проверка оплаты (Payment.status == COMPLETED)
4. Генерация полного ответа (большая модель)
5. Генерация PDF из markdown
6. Сохранение PDF в файловую систему
7. Создание записи FullAnswer
8. Обновление Request.full_answer
9. Возврат FullAnswerResponse с pdf_url
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

### Аутентификация
- **ОТКЛЮЧЕНА**: Все endpoints работают без токена
- Backend автоматически использует mock user (telegram_id = 123456789), если токен не предоставлен
- Frontend не отправляет токен в запросах
- Приложение сразу переходит к выбору трека после загрузки

### LLM Provider
- **Название провайдера не играет роли** - система работает с любым OpenAI-совместимым API
- Если указан `LLM_BASE_URL`, система автоматически использует его
- Пример: `LLM_BASE_URL=https://foundation-models.api.cloud.ru/v1`

### Security
- `.env` файлы **НЕ должны быть в git**
- Скрипт `update_vm.sh` автоматически сохраняет и восстанавливает `.env`
- Telegram initData валидация доступна, но не используется (auth отключена)

### Stateless Architecture
- Все состояние хранится в БД
- Backend полностью stateless
- Можно масштабировать горизонтально

### Frontend
- Использует `default export` для App компонента
- Все компоненты используют TailwindCSS
- API клиент централизован в `src/api/client.ts`
- **Не использует токены** - backend работает без них
- **Полностью русифицирован** - все тексты на русском

### Form Data
- Формы нормализуют данные перед отправкой
- Обрабатывают "Нет" в массивах (фильтруют из данных)
- Валидация на клиенте и сервере

---

## 🔗 Полезные ссылки

### Документация
- [Настройка VM с нуля](VM_SETUP_FROM_SCRATCH.md)
- [Быстрое обновление](QUICK_UPDATE.md)
- [Настройка Telegram](TELEGRAM_SETUP.md)
- [Настройка окружения](ENV_SETUP.md)
- [Решение проблем](TROUBLESHOOTING.md)
- [Проблемы с аутентификацией](AUTH_TROUBLESHOOTING.md)
- [Исправление initData](INITDATA_FIX.md)

### Внешние ресурсы
- Telegram Mini Apps: https://core.telegram.org/bots/webapps
- Telegram WebApp SDK: https://github.com/twa-dev/sdk
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- TailwindCSS: https://tailwindcss.com

---

## 🐛 Известные проблемы и решения

### Проблема: Запрос не отправляется
**Симптомы**: Форма заполнена, но запрос не уходит на backend

**Возможные причины**:
1. API_BASE_URL не настроен правильно
2. CORS ошибки
3. Backend не запущен
4. Ошибка в payload

**Решение**:
1. Проверить логи в консоли браузера: `[API]` и `[Form]`
2. Проверить, что backend запущен: `curl http://localhost:8000/health`
3. Проверить VITE_API_URL в frontend
4. Проверить CORS настройки в backend

### Проблема: LLM не генерирует ответ
**Симптомы**: Запрос создается, но demo ответ не генерируется

**Возможные причины**:
1. LLM_API_KEY не настроен
2. LLM_BASE_URL неверный
3. Ошибка в промпте
4. Превышен лимит токенов

**Решение**:
1. Проверить `backend/.env`: `LLM_API_KEY` и `LLM_BASE_URL`
2. Проверить логи backend: `docker-compose logs -f backend`
3. Проверить промпты в `backend/prompts/`

---

**Последнее обновление**: 2026-02-25
**Версия**: 0.2.0
**Статус**: Аутентификация отключена, интерфейс русифицирован, готов к тестированию LLM
