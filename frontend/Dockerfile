FROM node:22-alpine AS build

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json* /app/

# Install dependencies
RUN npm install

# Copy source files and configs
COPY frontend/tsconfig.json frontend/vite.config.ts /app/
COPY frontend/tailwind.config.js frontend/postcss.config.js /app/
COPY frontend/index.html /app/
COPY frontend/src /app/src

# Build
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

