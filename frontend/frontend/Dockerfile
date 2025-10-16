# ========================
# Frontend Dockerfile
# ========================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies including devDependencies for building
RUN npm install

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production image
FROM nginx:alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
