# Быстрый старт БЕЗ Homebrew

## Самый простой способ

### 1. Установите Python

**Скачайте с официального сайта:**
- Откройте https://www.python.org/downloads/
- Скачайте "macOS 64-bit universal2 installer" для Python 3.11+
- Запустите установщик
- **Важно:** Отметьте "Add Python to PATH"

### 2. Проверьте установку

```bash
python3 --version
# Должно показать: Python 3.11.x или выше
```

### 3. Создайте виртуальное окружение

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 4. Установите зависимости

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. Создайте .env файл

```bash
# Скопируйте шаблон
cp .env.example .env

# Отредактируйте .env и заполните:
# - TELEGRAM_BOT_TOKEN
# - TELEGRAM_BOT_USERNAME  
# - LLM_API_KEY
# - LLM_BASE_URL
# - SECRET_KEY (сгенерируйте: openssl rand -hex 32)
```

### 6. Запустите сервер

```bash
uvicorn app.main:app --reload
```

## Альтернатива: Используйте Docker

Если не хотите устанавливать Python локально:

```bash
# Убедитесь, что Docker установлен
docker --version

# Запустите все через docker-compose
cd infra
docker-compose up -d
```

## Что дальше?

- [Подробная инструкция без Homebrew](docs/SETUP_PYTHON_NO_BREW.md)
- [Настройка Telegram бота](docs/TELEGRAM_SETUP.md)
- [Заполнение .env файла](scripts/README-ENV.md)
