FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/tsconfig.json frontend/vite.config.ts /app/
COPY frontend/src /app/src
COPY frontend/index.html /app/index.html

RUN npm install && npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

