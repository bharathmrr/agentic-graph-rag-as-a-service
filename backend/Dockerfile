FROM python:3.9-slim

WORKDIR /app

# Copy requirements first for caching
COPY requirements.txt .

# Install dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose backend port
EXPOSE 8000

# Run backend
CMD ["python", "run_server.py"]
