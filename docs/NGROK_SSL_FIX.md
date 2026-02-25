# Исправление SSL ошибки при установке ngrok

## Проблема

При запуске `python start_ngrok.py` возникает ошибка:
```
SSL: CERTIFICATE_VERIFY_FAILED certificate verify failed
```

## Решение 1: Установить сертификаты Python (macOS)

### Автоматическая установка

```bash
# Найдите и запустите скрипт установки сертификатов
/Applications/Python\ 3.*/Install\ Certificates.command

# Или найдите вручную:
find /Applications -name "Install Certificates.command" 2>/dev/null
```

### Ручная установка

```bash
# Установите/обновите certifi
pip install --upgrade certifi

# Установите переменные окружения
export SSL_CERT_FILE=$(python -m certifi)
export REQUESTS_CA_BUNDLE=$(python -m certifi)
```

## Решение 2: Скачать ngrok вручную (рекомендуется)

### macOS (Apple Silicon)

```bash
# Скачайте напрямую
cd ~/Downloads
curl -L -o ngrok.zip https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip

# Распакуйте
unzip ngrok.zip

# Переместите в PATH
mkdir -p ~/bin
mv ngrok ~/bin/

# Добавьте в PATH (если еще не добавлено)
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Проверьте
ngrok --version

# Теперь используйте напрямую
ngrok http 8000
```

### macOS (Intel)

```bash
cd ~/Downloads
curl -L -o ngrok.zip https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip
unzip ngrok.zip
sudo mv ngrok /usr/local/bin/
ngrok http 8000
```

## Решение 3: Использовать альтернативы

### Cloudflare Tunnel (бесплатно)

```bash
# Скачайте cloudflared
# macOS: https://github.com/cloudflare/cloudflared/releases/latest
# Распакуйте и переместите в PATH

# Запустите
cloudflared tunnel --url http://localhost:8000
```

### localtunnel (через npm)

```bash
# Если есть Node.js
npm install -g localtunnel

# Запустите
lt --port 8000
```

## Решение 4: Обновить Python сертификаты

```bash
# В вашем venv
pip install --upgrade certifi requests

# Установите переменные окружения в ~/.zshrc
cat >> ~/.zshrc << 'EOF'
export SSL_CERT_FILE=$(python3 -m certifi 2>/dev/null || echo "")
export REQUESTS_CA_BUNDLE=$(python3 -m certifi 2>/dev/null || echo "")
EOF

source ~/.zshrc
```

## Быстрое решение (рекомендуется)

Просто скачайте ngrok вручную - это самый надежный способ:

```bash
# 1. Скачайте
cd ~/Downloads
curl -L -o ngrok.zip https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-arm64.zip

# 2. Распакуйте
unzip ngrok.zip

# 3. Установите
mkdir -p ~/bin
mv ngrok ~/bin/
echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 4. Используйте
ngrok http 8000
```

## Проверка

После установки проверьте:

```bash
ngrok --version
# Должно показать версию

# Запустите туннель
ngrok http 8000
# Должен показать Public URL
```

## Если ничего не помогает

Используйте деплой на VM с публичным IP - это самый надежный способ для продакшена.

См. [DEPLOY_VM.md](DEPLOY_VM.md)
