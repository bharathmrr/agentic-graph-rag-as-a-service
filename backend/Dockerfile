FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for caching
COPY backend/requirements.txt .

# Install dependencies
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy all backend source code
COPY backend/ ./

# Expose backend port
EXPOSE 8000

# Run backend server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
