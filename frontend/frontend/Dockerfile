# =====================
# Stage 1: Build
# =====================
FROM node:18-bullseye AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy all frontend files
COPY . .

# Rebuild native modules (fix rollup optional dependency issue)
RUN npm rebuild

# Build the frontend
RUN npm run build

# =====================
# Stage 2: Production
# =====================
FROM node:18-bullseye-slim AS production

WORKDIR /app

# Copy only build output
COPY --from=build /app/dist ./dist
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose port
EXPOSE 3000

# Start app (or serve static files if SPA)
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
