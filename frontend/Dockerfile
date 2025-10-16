# Build stage: Compiling or building your app
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage: Serving compiled app via Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

# Run Nginx as non-root user
RUN addgroup -g 1001 -S nginx && adduser -S nginx -u 1001 -G nginx \
  && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/log/nginx
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
