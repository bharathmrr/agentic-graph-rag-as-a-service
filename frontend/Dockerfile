FROM node:18-bullseye-slim AS base

WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM nginx:alpine AS production

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist .

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001 -G nodejs \
  && chown -R nextjs:nodejs /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nextjs

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
