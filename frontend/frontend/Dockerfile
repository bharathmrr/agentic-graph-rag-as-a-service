# =========================
# Stage 1: Base Dependencies
# =========================
FROM python:3.9-slim AS base
WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the backend code
COPY . .

# =========================
# Stage 2: Production
# =========================
FROM python:3.9-slim AS production
WORKDIR /app

# Copy installed packages and source code
COPY --from=base /app /app

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Command to run the backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
