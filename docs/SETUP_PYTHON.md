# Настройка Python окружения

> **Нет Homebrew?** См. [SETUP_PYTHON_NO_BREW.md](SETUP_PYTHON_NO_BREW.md) - инструкция без Homebrew

## Вариант 1: Использование venv (рекомендуется)

### 1. Установка Python

#### macOS (через Homebrew)

```bash
# Установите Homebrew, если еще не установлен
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Установите Python 3.11+
brew install python@3.11

# Проверьте версию
python3 --version
# Должно быть: Python 3.11.x или выше
```

#### Альтернатива: pyenv (для управления версиями Python)

```bash
# Установите pyenv через brew
brew install pyenv

# Добавьте в ~/.zshrc или ~/.bash_profile
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# Перезагрузите shell
source ~/.zshrc

# Установите Python 3.11
pyenv install 3.11.9
pyenv global 3.11.9

# Проверьте
python --version
```

### 2. Создание виртуального окружения

```bash
# Перейдите в директорию backend
cd backend

# Создайте виртуальное окружение
python3 -m venv venv

# Активируйте виртуальное окружение
source venv/bin/activate

# Проверьте, что активировано (в начале строки должно быть (venv))
which python
# Должно показать: .../backend/venv/bin/python
```

### 3. Установка зависимостей

#### Вариант A: Через pip (если нет poetry)

```bash
# Убедитесь, что venv активирован
source venv/bin/activate

# Обновите pip
pip install --upgrade pip

# Установите зависимости из pyproject.toml вручную
pip install fastapi uvicorn[standard] sqlalchemy asyncpg alembic python-dotenv pydantic-settings httpx pyjwt passlib reportlab markdown aiolimiter python-multipart

# Или создайте requirements.txt и используйте его
pip install -r requirements.txt
```

#### Вариант B: Через Poetry (рекомендуется)

```bash
# Установите Poetry через brew
brew install poetry

# Или через официальный установщик
curl -sSL https://install.python-poetry.org | python3 -

# Добавьте Poetry в PATH (если нужно)
export PATH="$HOME/.local/bin:$PATH"

# Перейдите в backend
cd backend

# Установите зависимости
poetry install

# Активируйте окружение Poetry
poetry shell

# Или запускайте команды через poetry run
poetry run uvicorn app.main:app --reload
```

### 4. Установка системных зависимостей через brew

Некоторые зависимости могут требовать системные библиотеки:

```bash
# PostgreSQL клиент (для работы с БД)
brew install postgresql

# Или только клиент
brew install libpq

# Для PDF генерации может понадобиться
brew install freetype

# Если используете ImageMagick для обработки изображений
brew install imagemagick
```

## Вариант 2: Использование Poetry (без venv)

Poetry автоматически создает виртуальное окружение:

```bash
# Установите Poetry
brew install poetry

# Перейдите в backend
cd backend

# Установите зависимости (Poetry создаст venv автоматически)
poetry install

# Активируйте shell
poetry shell

# Или используйте команды через poetry run
poetry run python scripts/seed.py
```

## Работа с виртуальным окружением

### Активация

```bash
# macOS/Linux
source venv/bin/activate

# Или с Poetry
poetry shell
```

### Деактивация

```bash
deactivate
```

### Проверка установленных пакетов

```bash
# С venv
pip list

# С Poetry
poetry show
```

### Обновление зависимостей

```bash
# С venv
pip install --upgrade package_name

# С Poetry
poetry update
```

## Создание requirements.txt (для venv)

Если используете venv без Poetry:

```bash
# Активируйте venv
source venv/bin/activate

# Создайте requirements.txt
pip freeze > requirements.txt

# Установите из requirements.txt
pip install -r requirements.txt
```

## Полная настройка с нуля

```bash
# 1. Установите Python через brew
brew install python@3.11

# 2. Перейдите в проект
cd /Users/amesin/MakeMeFit/backend

# 3. Создайте venv
python3 -m venv venv

# 4. Активируйте venv
source venv/bin/activate

# 5. Обновите pip
pip install --upgrade pip

# 6. Установите Poetry (опционально, но рекомендуется)
brew install poetry

# 7. Установите зависимости
poetry install
# ИЛИ
pip install fastapi uvicorn[standard] sqlalchemy asyncpg alembic python-dotenv pydantic-settings httpx pyjwt passlib reportlab markdown aiolimiter python-multipart

# 8. Установите PostgreSQL (если нужно локально)
brew install postgresql

# 9. Создайте .env файл
cp .env.example .env
# Заполните значения

# 10. Запустите миграции
poetry run alembic upgrade head
# ИЛИ
alembic upgrade head

# 11. Запустите сервер
poetry run uvicorn app.main:app --reload
# ИЛИ
uvicorn app.main:app --reload
```

## Проверка установки

```bash
# Проверьте Python
python --version
# Должно быть: Python 3.11.x или выше

# Проверьте pip
pip --version

# Проверьте установленные пакеты
pip list | grep fastapi
# Должно показать: fastapi

# Проверьте, что venv активен
which python
# Должно показать путь к venv/bin/python
```

## Troubleshooting

### "command not found: python3"

```bash
# Установите Python через brew
brew install python@3.11

# Создайте симлинк (если нужно)
ln -s /opt/homebrew/bin/python3.11 /usr/local/bin/python3
```

### "No module named 'venv'"

```bash
# Установите python3-venv
brew install python@3.11
```

### "Permission denied" при установке пакетов

```bash
# Убедитесь, что используете venv, а не системный Python
which pip
# Должно показать путь к venv/bin/pip

# Если показывает системный путь, активируйте venv
source venv/bin/activate
```

### Poetry не найден

```bash
# Добавьте в ~/.zshrc
export PATH="$HOME/.local/bin:$PATH"

# Или используйте полный путь
~/.local/bin/poetry install
```

## Рекомендации

1. **Используйте Poetry** - проще управление зависимостями
2. **Добавьте venv в .gitignore** - не коммитьте виртуальное окружение
3. **Используйте .env файлы** - не храните секреты в коде
4. **Документируйте зависимости** - обновляйте pyproject.toml или requirements.txt
