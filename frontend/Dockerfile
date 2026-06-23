# ============================================================
# Stage 1: Development (ng serve with hot reload)
# ============================================================
FROM node:22-alpine AS development
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

EXPOSE 4200
CMD ["npm", "start"]

# ============================================================
# Stage 2: Build
# ============================================================
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --omit=dev

COPY . .
RUN npm run build:prod

# ============================================================
# Stage 3: Production (nginx)
# ============================================================
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist/utilidades/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
