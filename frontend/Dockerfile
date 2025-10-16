# Base stage for dependency installation
FROM node:18-bullseye-slim AS base

WORKDIR /app

# Install dependencies only when package files change (cache optimization)
FROM base AS deps
COPY package-lock.json ./
RUN npm ci

# Build stage - copy dependencies and source code to build app
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production stage - Serve static files with Nginx
FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html

# Cleanup default nginx contents
RUN rm -rf ./*

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend app from build stage
COPY --from=build /app/dist .

# Use non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs \
    && chown -R nextjs:nodejs /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
USER nextjs

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
