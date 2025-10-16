# ============================
# Stage 1: Base Dependencies
# ============================
FROM node:18-alpine AS base
WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install --no-optional --legacy-peer-deps

# Copy the rest of the source code
COPY . .

# ============================
# Stage 2: (Optional) Build
# ============================
# If you want to skip the build inside Docker, comment the next line:
# RUN npm run build

# Instead, just echo a message to prevent failure
RUN echo "Skipping frontend build inside Docker (handled externally)"

# ============================
# Stage 3: Production Image
# ============================
FROM node:18-alpine AS production
WORKDIR /app

# Copy only built files (if they exist) or full app
COPY --from=base /app /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Default start command
CMD ["npm", "start"]
