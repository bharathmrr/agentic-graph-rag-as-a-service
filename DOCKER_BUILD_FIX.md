# Docker Build Fix - GitHub Actions

## Problem
The GitHub Actions workflow was failing with the error:
```
ERROR: failed to build: failed to solve: failed to read dockerfile: open Dockerfile: no such file or directory
```

## Root Cause
The GitHub Actions workflow in `.github/workflows/docker-build.yml` was looking for the Dockerfile at:
- `./frontend/Dockerfile` 

But the actual Dockerfile was located at:
- `./frontend/frontend/Dockerfile`

## Solution Applied

### 1. Copied Missing Files
- ✅ Copied `Dockerfile` from `./frontend/frontend/Dockerfile` to `./frontend/Dockerfile`
- ✅ Copied `nginx.conf` from `./frontend/frontend/nginx.conf` to `./frontend/nginx.conf`

### 2. Fixed .dockerignore
- ✅ Removed `Dockerfile*` and `.dockerignore` from the ignore list in `./frontend/.dockerignore`
- ✅ This ensures the Dockerfile and nginx.conf are included in the build context

### 3. Verified Backend
- ✅ Confirmed backend Dockerfile is correctly located at `./backend/Dockerfile`

## Files Modified
1. **Created**: `./frontend/Dockerfile` - Multi-stage Docker build for React frontend
2. **Created**: `./frontend/nginx.conf` - Nginx configuration with API proxy
3. **Modified**: `./frontend/.dockerignore` - Removed Dockerfile exclusion

## Docker Build Configuration
The Dockerfile includes:
- **Base Stage**: Node.js 18 Alpine with dependency installation
- **Development Stage**: Full dev environment with hot reload
- **Build Stage**: Production build generation
- **Production Stage**: Nginx Alpine with built assets

## Next Steps
1. Commit these changes to the repository
2. Push to trigger the GitHub Actions workflow
3. The Docker build should now succeed

## Verification
After pushing, the GitHub Actions workflow should:
- ✅ Find the Dockerfile at the expected location
- ✅ Successfully build the frontend Docker image
- ✅ Push to GitHub Container Registry (ghcr.io)

## Technical Details
- **Frontend Framework**: React with Vite
- **Production Server**: Nginx Alpine
- **Build Context**: `./frontend/`
- **Target Platforms**: linux/amd64, linux/arm64
- **Registry**: ghcr.io/bharathmrr/agentic-graph-rag-as-a-service-frontend
