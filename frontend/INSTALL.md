# Frontend Installation Instructions

## ⚠️ Важно: Сборка происходит в Docker на VM

Все зависимости (включая TailwindCSS) устанавливаются автоматически при сборке Docker образа. **Не требуется** устанавливать npm локально.

## Docker Build (на VM)

Сборка происходит автоматически при выполнении:

```bash
cd /opt/makemefit/infra
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

Или через скрипт обновления:

```bash
cd /opt/makemefit
./scripts/update_vm.sh
```

## Что происходит при сборке

1. Dockerfile копирует `package.json` (с TailwindCSS в devDependencies)
2. Выполняется `npm install` - устанавливаются все зависимости
3. Копируются конфигурационные файлы (tailwind.config.js, postcss.config.js)
4. Копируется исходный код
5. Выполняется `npm run build` - Vite собирает проект с TailwindCSS
6. Собранные файлы копируются в nginx контейнер

## Локальная разработка (опционально)

Если нужно запустить локально для разработки:

```bash
cd frontend
npm install  # Установит TailwindCSS и другие зависимости
npm run dev  # Запустит dev сервер на localhost:5173
```

Но для production деплоя это **не требуется** - все происходит в Docker.
