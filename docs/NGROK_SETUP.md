# Настройка ngrok для локального тестирования

## Проблема

Если вы установили `ngrok` через `pip install ngrok`, это Python пакет, а не бинарный файл. Команда `ngrok` не будет работать.

## Решение 1: Установить настоящий ngrok (рекомендуется)

### macOS (без Homebrew)

1. **Скачайте ngrok:**
   ```bash
   # Перейдите на https://ngrok.com/download
   # Или скачайте напрямую:
   cd ~/Downloads
   curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip
   # Или для Apple Silicon:
   curl -O https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip
   ```

2. **Распакуйте:**
   ```bash
   unzip ngrok-v3-stable-darwin-*.zip
   ```

3. **Переместите в PATH:**
   ```bash
   sudo mv ngrok /usr/local/bin/
   # Или в локальную директорию:
   mkdir -p ~/bin
   mv ngrok ~/bin/
   echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Проверьте:**
   ```bash
   ngrok --version
   ```

5. **Зарегистрируйтесь (опционально, но рекомендуется):**
   - Перейдите на https://dashboard.ngrok.com/signup
   - Создайте аккаунт
   - Скопируйте authtoken
   - Выполните: `ngrok config add-authtoken YOUR_TOKEN`

### Использование

```bash
# Запустите туннель для backend
ngrok http 8000

# Скопируйте HTTPS URL (например: https://abc123.ngrok.io)
```

## Решение 2: Использовать Python модуль ngrok

Если вы уже установили `pip install ngrok`, можно использовать через Python:

### Вариант A: Через Python скрипт

Создайте файл `start_ngrok.py`:

```python
from pyngrok import ngrok

# Запустите туннель
public_url = ngrok.connect(8000)
print(f"Public URL: {public_url}")

# Держите туннель открытым
input("Press Enter to stop...")
ngrok.kill()
```

Запустите:
```bash
python start_ngrok.py
```

### Вариант B: Через pyngrok (лучший вариант)

```bash
# Установите pyngrok (это правильный пакет)
pip install pyngrok

# Используйте в Python
python -c "from pyngrok import ngrok; print(ngrok.connect(8000))"
```

Или создайте простой скрипт:

```python
#!/usr/bin/env python3
from pyngrok import ngrok
import time

# Запустите туннель
tunnel = ngrok.connect(8000)
print(f"Public URL: {tunnel.public_url}")
print("Press Ctrl+C to stop")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    ngrok.kill()
    print("Tunnel closed")
```

## Решение 3: Использовать альтернативы ngrok

### Cloudflare Tunnel (бесплатно, без регистрации для базового использования)

```bash
# Установите cloudflared
# macOS: скачайте с https://github.com/cloudflare/cloudflared/releases
# Или через установщик

# Запустите туннель
cloudflared tunnel --url http://localhost:8000
```

### localtunnel (npm)

```bash
# Установите Node.js (если нет)
# Затем:
npm install -g localtunnel

# Запустите
lt --port 8000
```

## Рекомендуемый способ для вашего случая

Так как у вас уже установлен Python пакет ngrok, используйте `pyngrok`:

```bash
# Удалите неправильный пакет (опционально)
pip uninstall ngrok

# Установите правильный
pip install pyngrok

# Создайте скрипт для запуска
cat > start_ngrok.py << 'EOF'
#!/usr/bin/env python3
from pyngrok import ngrok
import time

tunnel = ngrok.connect(8000)
print(f"\n✅ Public URL: {tunnel.public_url}")
print("Press Ctrl+C to stop\n")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    ngrok.kill()
    print("\n❌ Tunnel closed")
EOF

chmod +x start_ngrok.py

# Запустите
python start_ngrok.py
```

## Быстрая команда

```bash
# Установите pyngrok
pip install pyngrok

# Запустите одной командой
python -c "from pyngrok import ngrok; tunnel = ngrok.connect(8000); print(f'Public URL: {tunnel.public_url}'); import time; [time.sleep(1) for _ in iter(int, 1)]"
```

Или создайте алиас в `~/.zshrc`:

```bash
echo 'alias ngrok-start="python -c \"from pyngrok import ngrok; import time; tunnel = ngrok.connect(8000); print(f\\\"Public URL: {tunnel.public_url}\\\"); [time.sleep(1) for _ in iter(int, 1)]\""' >> ~/.zshrc
source ~/.zshrc

# Теперь можно использовать:
ngrok-start
```
