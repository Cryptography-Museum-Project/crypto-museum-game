# --- Этап 1: сборка игры и админки ---
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Пустой адрес API = запросы идут на тот же домен (/api/...),
# а nginx перенаправляет их в контейнер бэкенда.
ENV VITE_API_URL=""
RUN npm run build

# --- Этап 2: раздача готовых файлов через nginx ---
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
