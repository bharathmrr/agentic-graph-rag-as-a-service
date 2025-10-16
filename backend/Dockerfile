# ========================
# Backend Dockerfile
# ========================
FROM python:3.9-slim AS build

# Set working directory
WORKDIR /app

# Copy only requirements first for caching
COPY backend/requirements.txt .

# Upgrade pip and install all dependencies
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Expose backend port
EXPOSE 8000

# Run backend server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
