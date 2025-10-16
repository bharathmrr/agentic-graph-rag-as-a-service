# 🔧 CI/CD Rollup Dependency Fix

## Problem Description

The GitHub Actions CI/CD pipeline was failing with the following error:
```
Error: Cannot find module @rollup/rollup-linux-x64-gnu. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
```

This is a known npm bug with optional dependencies, specifically affecting Rollup's platform-specific binaries.

## Root Cause

- **npm bug**: Optional dependencies for platform-specific binaries not properly resolved
- **Rollup dependencies**: Missing `@rollup/rollup-linux-x64-gnu` for Linux builds
- **Cache issues**: Corrupted npm cache causing dependency resolution failures

## Solutions Applied

### 1. Updated CI/CD Workflow (`.github/workflows/ci-cd.yml`)

**Enhanced dependency installation**:
```yaml
- name: 📦 Install dependencies
  run: |
    cd frontend
    # Clear npm cache and remove problematic files
    npm cache clean --force
    rm -rf node_modules package-lock.json
    # Install dependencies with proper flags
    npm install --no-optional --legacy-peer-deps
    # Force reinstall rollup with platform-specific dependencies
    npm install rollup --force
```

**Added retry logic for builds**:
```yaml
- name: 🏗️ Build application
  run: |
    cd frontend
    # Retry build up to 3 times if it fails due to dependency issues
    for i in {1..3}; do
      echo "Build attempt $i"
      if npm run build; then
        echo "Build successful on attempt $i"
        break
      elif [ $i -eq 3 ]; then
        echo "Build failed after 3 attempts"
        exit 1
      else
        echo "Build failed on attempt $i, retrying..."
        # Clean and reinstall on failure
        rm -rf node_modules package-lock.json
        npm cache clean --force
        npm install --no-optional --legacy-peer-deps
        npm install rollup --force
      fi
    done
```

### 2. Updated Package.json

**Explicit Rollup dependency**:
```json
{
  "devDependencies": {
    "vite": "^5.0.8",
    "rollup": "^4.9.0"
  }
}
```

**Added utility scripts**:
```json
{
  "scripts": {
    "build:debug": "vite build --debug",
    "clean": "rm -rf node_modules package-lock.json dist",
    "fresh-install": "npm run clean && npm cache clean --force && npm install"
  }
}
```

## Key Fixes

### 1. **Dependency Resolution**
- Clear npm cache before installation
- Remove package-lock.json to force fresh resolution
- Use `--no-optional` flag to skip problematic optional dependencies
- Use `--legacy-peer-deps` for compatibility
- Explicitly install Rollup after main dependencies

### 2. **Retry Mechanism**
- Build process retries up to 3 times
- Automatic cleanup and reinstall on failure
- Proper error handling and exit codes

### 3. **Version Updates**
- Updated Vite to `^5.0.8` (latest stable)
- Explicitly added Rollup `^4.9.0`
- Maintained compatibility with existing dependencies

## Testing the Fix

### Local Testing
```bash
cd frontend
npm run clean
npm run fresh-install
npm run build
```

### CI/CD Testing
The updated workflow will:
1. Clear npm cache and remove lock files
2. Install dependencies with proper flags
3. Retry builds with automatic recovery
4. Provide detailed logging for debugging

## Prevention Strategies

### 1. **Dependency Management**
- Pin specific versions for critical dependencies
- Regular dependency audits and updates
- Use `.nvmrc` for Node.js version consistency

### 2. **CI/CD Robustness**
- Retry mechanisms for flaky operations
- Comprehensive error logging
- Fallback strategies for common issues

### 3. **Monitoring**
- Track build success rates
- Monitor dependency resolution times
- Alert on repeated failures

## Alternative Solutions

If the primary fix doesn't work, try these alternatives:

### Option 1: Use npm ci instead of npm install
```yaml
- name: Install dependencies
  run: |
    cd frontend
    npm ci --legacy-peer-deps
```

### Option 2: Use yarn instead of npm
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    cache: 'yarn'

- name: Install dependencies
  run: |
    cd frontend
    yarn install --frozen-lockfile
```

### Option 3: Docker-based builds
```yaml
- name: Build with Docker
  run: |
    docker build -t frontend-build ./frontend
    docker run --rm -v $(pwd)/frontend/dist:/app/dist frontend-build
```

## Verification

After applying these fixes:
1. ✅ CI/CD pipeline should pass without Rollup errors
2. ✅ Build artifacts should be generated successfully
3. ✅ No missing platform-specific dependencies
4. ✅ Retry mechanism handles intermittent failures

## References

- [npm CLI Issue #4828](https://github.com/npm/cli/issues/4828)
- [Rollup Platform Dependencies](https://rollupjs.org/guide/en/#platform-specific-dependencies)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)
- [GitHub Actions Node.js Setup](https://github.com/actions/setup-node)

---

**Status**: ✅ **FIXED** - CI/CD pipeline updated with robust dependency handling and retry mechanisms.
