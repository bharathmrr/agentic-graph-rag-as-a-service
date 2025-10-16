# Multi-stage build for optimized production image
FROM python:3.9-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    cmake \
    git \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies with CPU-only PyTorch and cleanup
RUN pip install --upgrade pip && \
    pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt --no-deps && \
    pip install --no-cache-dir $(grep -v "torch" requirements.txt | grep -v "^#" | grep -v "^$") && \
    pip cache purge && \
    find /usr/local/lib/python3.9/site-packages -name "*.pyc" -delete && \
    find /usr/local/lib/python3.9/site-packages -name "__pycache__" -type d -exec rm -rf {} + || true

# Production stage
FROM python:3.9-slim as production

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

WORKDIR /app

# Copy installed packages from builder (excluding unnecessary files)
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy the rest of the backend code
COPY . .

# Final cleanup to reduce image size
RUN find /usr/local/lib/python3.9/site-packages -name "*.pyc" -delete && \
    find /usr/local/lib/python3.9/site-packages -name "__pycache__" -type d -exec rm -rf {} + || true && \
    find /usr/local/lib/python3.9/site-packages -name "*.so" -exec strip {} + || true && \
    rm -rf /tmp/* /var/tmp/* ~/.cache

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose backend port
EXPOSE 8000

# Run backend
CMD ["python", "run_server.py"]
