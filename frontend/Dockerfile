# Multi-stage build for Frontend (works around Rollup optional-deps issue)
FROM node:18-bullseye-slim AS base

# 1) Base deps (production only)
WORKDIR /app
COPY package*.json ./
# Workaround: drop lock + node_modules and reinstall cleanly
RUN rm -rf node_modules package-lock.json \
    && npm install --omit=dev \
    && npm cache clean --force

# 2) Dev stage (full deps)
FROM base AS development
RUN rm -rf node_modules package-lock.json && npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 3) Build stage (needs dev deps for Vite)
FROM base AS build
RUN rm -rf node_modules package-lock.json && npm install
COPY . .
RUN npm run build

# 4) Runtime stage (nginx)
FROM nginx:alpine AS production
RUN apk add --no-cache curl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Non-root user and permissions
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001 \
 && chown -R nextjs:nodejs /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d
USER nextjs

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:80/ || exit 1
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
