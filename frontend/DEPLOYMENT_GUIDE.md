# 🚀 Agentic Graph RAG - Deployment Guide

## 📋 Table of Contents
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- 8GB+ RAM recommended
- 20GB+ disk space

### 1. Clone Repository
```bash
git clone https://github.com/bharathmrr/agentic-graph-rag-as-a-service.git
cd agentic-graph-rag-as-a-service
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys
nano .env
```

### 3. Start Development Environment
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 4. Access Applications
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Neo4j Browser**: http://localhost:7474
- **ChromaDB**: http://localhost:8001

## 🛠️ Development Setup

### Backend Development
```bash
# Start only dependencies
docker-compose up -d neo4j chromadb redis

# Run backend locally
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
# Start backend services
docker-compose up -d backend

# Run frontend locally
cd frontend
npm install
npm run dev
```

### Hot Reload Development
```bash
# Full development with hot reload
docker-compose -f docker-compose.yml up -d
```

## 🌟 Production Deployment

### 1. Production Environment Setup
```bash
# Copy production environment
cp .env.example .env.prod

# Configure production variables
nano .env.prod
```

Required production environment variables:
```bash
# Security
SECRET_KEY=your-super-secret-key-here
NEO4J_PASSWORD=secure-neo4j-password
REDIS_PASSWORD=secure-redis-password
GRAFANA_PASSWORD=secure-grafana-password

# API Keys
OPENAI_API_KEY=your-openai-key
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key

# Domain Configuration
CORS_ORIGINS=https://yourdomain.com
ALLOWED_HOSTS=yourdomain.com
```

### 2. Production Deployment
```bash
# Deploy production stack
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# With monitoring
docker-compose -f docker-compose.prod.yml --profile monitoring --env-file .env.prod up -d
```

### 3. SSL/HTTPS Setup
```bash
# Create SSL directory
mkdir -p ssl

# Add your SSL certificates
cp your-cert.crt ssl/
cp your-private.key ssl/

# Update nginx configuration
nano nginx/nginx.prod.conf
```

### 4. Scaling Services
```bash
# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale with specific resources
docker-compose -f docker-compose.prod.yml up -d --scale backend=2 --scale frontend=2
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

1. **Repository Secrets** (Settings → Secrets and variables → Actions):
```
OPENAI_API_KEY=your-openai-key
GROQ_API_KEY=your-groq-key
GEMINI_API_KEY=your-gemini-key
NEO4J_PASSWORD=production-password
REDIS_PASSWORD=production-password
SECRET_KEY=production-secret-key
```

2. **Workflow Triggers**:
- **Push to `main`**: Production deployment
- **Push to `develop`**: Staging deployment
- **Pull Requests**: Testing and validation
- **Tags `v*`**: Release deployment

### Manual Deployment
```bash
# Build and push images
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/bharathmrr/agentic-graph-rag-backend:latest ./backend --push
docker buildx build --platform linux/amd64,linux/arm64 -t ghcr.io/bharathmrr/agentic-graph-rag-frontend:latest ./frontend --push

# Deploy using pre-built images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

### Prometheus Metrics
- **URL**: http://localhost:9090
- **Metrics**: Application performance, system resources
- **Retention**: 30 days (production)

### Grafana Dashboards
- **URL**: http://localhost:3001
- **Default Login**: admin / (see GRAFANA_PASSWORD)
- **Dashboards**: System overview, API metrics, database performance

### Health Checks
```bash
# Check all services
curl http://localhost:8000/health  # Backend
curl http://localhost:3000/health  # Frontend
curl http://localhost:7474         # Neo4j
curl http://localhost:8001/api/v1/heartbeat  # ChromaDB
```

### Log Management
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f neo4j

# Log rotation (production)
docker-compose -f docker-compose.prod.yml exec backend logrotate /etc/logrotate.conf
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Memory Issues
```bash
# Increase Docker memory limit
# Docker Desktop → Settings → Resources → Memory: 8GB+

# Check memory usage
docker stats
```

#### 2. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8000

# Change ports in docker-compose.yml
ports:
  - "8080:8000"  # Change external port
```

#### 3. Database Connection Issues
```bash
# Reset Neo4j data
docker-compose down
docker volume rm agentic-graph-rag-as-a-service_neo4j_data
docker-compose up -d neo4j

# Reset ChromaDB data
docker volume rm agentic-graph-rag-as-a-service_chromadb_data
```

#### 4. API Key Issues
```bash
# Verify environment variables
docker-compose exec backend env | grep API_KEY

# Update secrets
docker-compose down
nano .env
docker-compose up -d
```

### Performance Optimization

#### 1. Database Tuning
```bash
# Neo4j memory settings (docker-compose.yml)
NEO4J_dbms_memory_heap_max_size=4G
NEO4J_dbms_memory_pagecache_size=2G

# ChromaDB optimization
CHROMA_SERVER_CORS_ALLOW_ORIGINS=["*"]
```

#### 2. Backend Scaling
```bash
# Increase worker processes
CMD ["gunicorn", "main:app", "-w", "8", "-k", "uvicorn.workers.UvicornWorker"]

# Use Redis for caching
REDIS_URL=redis://redis:6379
```

#### 3. Frontend Optimization
```bash
# Enable gzip compression (nginx.conf)
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# Cache static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 🛡️ Security

### Production Security Checklist
- [ ] Change default passwords
- [ ] Use strong SECRET_KEY
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable firewall rules
- [ ] Regular security updates
- [ ] Monitor access logs

### Backup Strategy
```bash
# Neo4j backup
docker-compose exec neo4j neo4j-admin dump --database=neo4j --to=/backups/neo4j-backup.dump

# ChromaDB backup
docker cp agentic-chromadb:/chroma/chroma ./backups/chromadb-backup

# Application data backup
docker-compose exec backend tar -czf /backups/uploads-backup.tar.gz /app/uploads
```

## 📞 Support

- **Documentation**: [API Docs](http://localhost:8000/docs)
- **Issues**: [GitHub Issues](https://github.com/bharathmrr/agentic-graph-rag-as-a-service/issues)
- **Discussions**: [GitHub Discussions](https://github.com/bharathmrr/agentic-graph-rag-as-a-service/discussions)

---
**Built with ❤️ for the AI and Knowledge Graph community**
