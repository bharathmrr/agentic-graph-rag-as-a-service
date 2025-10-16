FROM node:18-bullseye-slim AS build
WORKDIR /app
COPY package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
