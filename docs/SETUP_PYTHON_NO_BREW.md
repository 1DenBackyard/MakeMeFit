# Настройка Python без Homebrew

## Вариант 1: Установка Python с официального сайта (рекомендуется)

### macOS

1. **Скачайте Python:**
   - Перейдите на https://www.python.org/downloads/
   - Скачайте Python 3.11 или новее для macOS
   - Установите .pkg файл

2. **Проверьте установку:**
   ```bash
   python3 --version
   # Должно показать: Python 3.11.x или выше
   ```

3. **Создайте venv:**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Установите зависимости:**
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

## Вариант 2: Использование системного Python (если уже установлен)

### Проверьте, есть ли Python

```bash
# Проверьте версию
python3 --version

# Если Python 3.11+, можно использовать
which python3
```

### Если Python уже установлен

```bash
cd backend

# Создайте venv
python3 -m venv venv

# Активируйте
source venv/bin/activate

# Установите зависимости
pip install --upgrade pip
pip install -r requirements.txt
```

## Вариант 3: Установка Poetry без Homebrew

### Способ 1: Официальный установщик Poetry

```bash
# Установите Poetry
curl -sSL https://install.python-poetry.org | python3 -

# Добавьте в PATH (добавьте в ~/.zshrc или ~/.bash_profile)
export PATH="$HOME/.local/bin:$PATH"

# Перезагрузите shell
source ~/.zshrc  # или source ~/.bash_profile

# Проверьте
poetry --version
```

### Способ 2: Установка Poetry через pip

```bash
# Сначала создайте venv
python3 -m venv venv
source venv/bin/activate

# Установите Poetry
pip install poetry

# Используйте Poetry
poetry install
```

## Вариант 4: Использование pyenv без Homebrew

### Установка pyenv вручную

```bash
# Клонируйте pyenv
git clone https://github.com/pyenv/pyenv.git ~/.pyenv

# Добавьте в ~/.zshrc или ~/.bash_profile
echo 'export PYENV_ROOT="$HOME/.pyenv"' >> ~/.zshrc
echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' >> ~/.zshrc
echo 'eval "$(pyenv init -)"' >> ~/.zshrc

# Перезагрузите shell
source ~/.zshrc

# Установите зависимости для компиляции Python (если нужно)
# Для macOS может понадобиться Xcode Command Line Tools
xcode-select --install

# Установите Python
pyenv install 3.11.9
pyenv global 3.11.9

# Проверьте
python --version
```

## Вариант 5: Использование Docker (самый простой, если нет Python)

Если у вас нет Python и вы не можете его установить, используйте Docker:

```bash
# Убедитесь, что Docker установлен
docker --version

# Запустите через docker-compose
cd infra
docker-compose up -d

# Или соберите и запустите вручную
cd backend
docker build -t makemefit-backend .
docker run -p 8000:8000 --env-file .env makemefit-backend
```

## Вариант 6: Miniconda/Anaconda

### Установка Miniconda

1. **Скачайте Miniconda:**
   - Перейдите на https://docs.conda.io/en/latest/miniconda.html
   - Скачайте установщик для macOS
   - Запустите установщик

2. **Создайте окружение:**
   ```bash
   # Создайте conda окружение
   conda create -n makemefit python=3.11
   conda activate makemefit

   # Установите зависимости
   cd backend
   pip install -r requirements.txt
   ```

## Полная инструкция для macOS без Homebrew

### Шаг 1: Установите Python

**Способ A: С официального сайта**
1. Откройте https://www.python.org/downloads/
2. Скачайте "macOS 64-bit universal2 installer"
3. Запустите установщик
4. **Важно:** Отметьте "Add Python to PATH" при установке

**Способ B: Проверьте системный Python**
```bash
python3 --version
# Если показывает 3.11+, можно использовать
```

### Шаг 2: Создайте виртуальное окружение

```bash
# Перейдите в backend
cd /Users/your-user/MakeMeFit/backend

# Создайте venv
python3 -m venv venv

# Активируйте venv
source venv/bin/activate

# Проверьте (должно показать путь к venv)
which python
```

### Шаг 3: Установите зависимости

```bash
# Обновите pip
pip install --upgrade pip

# Установите все зависимости
pip install fastapi uvicorn[standard] sqlalchemy asyncpg alembic python-dotenv pydantic-settings httpx pyjwt passlib reportlab markdown aiolimiter python-multipart

# Или из файла (если создали requirements.txt)
pip install -r requirements.txt
```

### Шаг 4: Установите PostgreSQL (если нужно локально)

**Без Homebrew:**

1. **Скачайте PostgreSQL:**
   - Перейдите на https://www.postgresql.org/download/macosx/
   - Скачайте установщик от EnterpriseDB
   - Установите через .dmg файл

2. **Или используйте Docker для PostgreSQL:**
   ```bash
   docker run -d \
     --name makemefit-postgres \
     -e POSTGRES_USER=makemefit \
     -e POSTGRES_PASSWORD=makemefit \
     -e POSTGRES_DB=makemefit \
     -p 5432:5432 \
     postgres:15
   ```

## Проверка установки

```bash
# 1. Проверьте Python
python3 --version
# Должно быть: Python 3.11.x или выше

# 2. Активируйте venv
cd backend
source venv/bin/activate

# 3. Проверьте pip
pip --version

# 4. Проверьте установленные пакеты
pip list | grep fastapi
# Должно показать: fastapi

# 5. Проверьте, что venv активен
which python
# Должно показать: .../backend/venv/bin/python
```

## Troubleshooting

### "python3: command not found"

**Решение:**
1. Установите Python с https://www.python.org/downloads/
2. Или проверьте, установлен ли Python:
   ```bash
   /usr/bin/python3 --version
   ```
3. Если установлен, создайте алиас:
   ```bash
   echo 'alias python3=/usr/bin/python3' >> ~/.zshrc
   source ~/.zshrc
   ```

### "No module named 'venv'"

**Решение:**
```bash
# Установите python3-venv (если доступно)
# Или используйте virtualenv
pip install virtualenv
virtualenv venv
source venv/bin/activate
```

### "pip: command not found"

**Решение:**
```bash
# Используйте pip3
pip3 install --upgrade pip

# Или установите pip через get-pip.py
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
python3 get-pip.py
```

### "Permission denied" при установке пакетов

**Решение:**
```bash
# Убедитесь, что используете venv
source venv/bin/activate

# Проверьте, что pip указывает на venv
which pip
# Должно показать: .../venv/bin/pip
```

## Рекомендуемый путь (без Homebrew)

1. **Установите Python с python.org** (самый простой способ)
2. **Используйте venv** (встроен в Python)
3. **Установите зависимости через pip**
4. **Для PostgreSQL используйте Docker** (если нужно локально)

## Быстрая команда для старта

```bash
# 1. Установите Python с python.org (вручную)

# 2. Создайте и активируйте venv
cd backend
python3 -m venv venv
source venv/bin/activate

# 3. Установите зависимости
pip install --upgrade pip
pip install fastapi uvicorn[standard] sqlalchemy asyncpg alembic python-dotenv pydantic-settings httpx pyjwt passlib reportlab markdown aiolimiter python-multipart

# 4. Создайте .env файл и заполните значения

# 5. Запустите сервер
uvicorn app.main:app --reload
```

## Альтернатива: Используйте Docker

Если установка Python вызывает проблемы, используйте Docker - все уже настроено:

```bash
cd infra
docker-compose up -d
```

Это запустит и backend, и frontend, и PostgreSQL в контейнерах.
