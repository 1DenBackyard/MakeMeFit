# Исправление проблемы с Docker кэшем

## Проблема
Docker видит поврежденную версию файла `frontend/src/ui/App.tsx`, хотя локально файл правильный.

## Решение

### 1. Полная очистка и пересборка

```bash
cd /Users/amesin/MakeMeFit

# Остановить контейнеры
docker-compose -f infra/docker-compose.yml down

# Удалить образ frontend
docker rmi makemefit-frontend infra-frontend 2>/dev/null || true

# Очистить build cache
docker builder prune -af

# Пересобрать без кэша
cd infra
docker-compose build --no-cache --pull frontend
```

### 2. Если проблема сохраняется

Проверьте, что файл действительно правильный:

```bash
# Проверка файла
head -5 frontend/src/ui/App.tsx
grep -n "setFullAnswer(full)" frontend/src/ui/App.tsx
grep -n "useState<{ full_answer" frontend/src/ui/App.tsx
```

Должно быть:
- Строка 1: `import React, { useEffect, useState } from 'react';`
- Строка 30: `const [fullAnswer, setFullAnswer] = useState<{ full_answer: string; pdf_url?: string } | null>(null);`
- Строка 84: `setFullAnswer(full);`

### 3. Принудительное обновление файла

Если файл все еще поврежден в Docker:

```bash
# Удалить файл и пересоздать
rm frontend/src/ui/App.tsx

# Скопировать правильную версию из git (если есть)
git checkout frontend/src/ui/App.tsx

# Или пересоздать вручную (см. правильную версию в коде)
```

### 4. Проверка после сборки

```bash
# Запустить контейнер
docker-compose -f infra/docker-compose.yml up -d frontend

# Проверить логи
docker-compose -f infra/docker-compose.yml logs frontend

# Проверить файл внутри контейнера
docker exec makemefit-frontend cat /usr/share/nginx/html/index.html | head -20
```

## Примечание

Файл `frontend/src/ui/App.tsx` должен содержать:
- 210 строк
- Правильные импорты
- Правильный тип для `fullAnswer`: `useState<{ full_answer: string; pdf_url?: string } | null>(null)`
- Правильный вызов: `setFullAnswer(full)` (не `setFullAnswer(full.full_answer)`)
