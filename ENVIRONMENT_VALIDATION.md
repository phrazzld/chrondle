# Environment Validation Guide

Comprehensive validation framework for Chrondle development and production environments.

## Environment Variables

### Required Variables

#### Development Environment
```bash
# .env.local
OPENROUTER_API_KEY=your_api_key_here
SITE_URL=http://localhost:3000
NODE_ENV=development
```

#### Production Environment
```bash
# .env.production or deployment platform environment variables
OPENROUTER_API_KEY=your_production_api_key
SITE_URL=https://yourdomain.com
NODE_ENV=production
```

### Optional Variables
```bash
# Debug configuration
DEBUG_MODE=false
LOG_LEVEL=info

# Performance monitoring
ENABLE_ANALYTICS=true
PERFORMANCE_MONITORING=true
```

## Environment Validation Checklist

### Development Environment
- [ ] **Node.js Version**: ≥18.0.0 (recommended: LTS)
- [ ] **npm/pnpm**: Latest stable version
- [ ] **TypeScript**: ≥5.0.0
- [ ] **Next.js**: 15.3.4 (as specified in package.json)
- [ ] **.env.local**: Exists with required variables
- [ ] **Build Success**: `npm run build` completes without errors
- [ ] **Lint Success**: `npm run lint` passes all checks
- [ ] **Dev Server**: `npm run dev` starts successfully
- [ ] **Port Access**: Port 3000 available for development

### Production Environment
- [ ] **Environment Variables**: All required vars set in deployment platform
- [ ] **OpenRouter API Key**: Valid and active with sufficient quota
- [ ] **Site URL**: Correct production domain configured
- [ ] **HTTPS**: SSL certificate configured and valid
- [ ] **Build Process**: Production build succeeds
- [ ] **Performance**: Meets benchmarks from TESTING.md
- [ ] **Error Monitoring**: Logging/monitoring systems configured
- [ ] **Backup Strategy**: Data persistence and recovery plan

## Configuration Validation

### Environment Variable Validation Script

Create this validation script for deployment processes:

```typescript
// scripts/validate-env.ts
interface EnvironmentConfig {
  OPENROUTER_API_KEY: string;
  SITE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  DEBUG_MODE?: string;
  LOG_LEVEL?: string;
}

function validateEnvironment(): EnvironmentConfig {
  const requiredVars = ['OPENROUTER_API_KEY', 'SITE_URL', 'NODE_ENV'];
  const missing: string[] = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate SITE_URL format
  try {
    new URL(process.env.SITE_URL!);
  } catch (error) {
    throw new Error('SITE_URL must be a valid URL');
  }
  
  // Validate NODE_ENV
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV!)) {
    throw new Error('NODE_ENV must be development, production, or test');
  }
  
  return process.env as EnvironmentConfig;
}

export { validateEnvironment };
```

### Runtime Environment Checks

Add this to your application startup:

```typescript
// src/lib/env-validation.ts
export function validateRuntimeEnvironment() {
  const issues: string[] = [];
  
  // Check required browser APIs
  if (typeof window !== 'undefined') {
    if (!window.localStorage) {
      issues.push('localStorage not available');
    }
    if (!window.fetch) {
      issues.push('fetch API not available');
    }
    if (!window.URLSearchParams) {
      issues.push('URLSearchParams not available');
    }
  }
  
  // Check server environment
  if (typeof window === 'undefined') {
    if (!process.env.OPENROUTER_API_KEY && process.env.NODE_ENV === 'production') {
      issues.push('OPENROUTER_API_KEY required in production');
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}
```

## Deployment Validation

### Pre-Deployment Checklist

#### Build Validation
```bash
# Verify clean build
npm run build

# Check build output size
ls -la .next/static/

# Verify no build warnings
npm run build 2>&1 | grep -i warning
```

#### Functionality Validation
```bash
# Start production server locally
npm run build && npm start

# Test critical paths
curl http://localhost:3000
curl http://localhost:3000?debug=true&year=2020
```

#### Performance Validation
```bash
# Lighthouse audit
npx lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-report.json

# Bundle analysis
npx @next/bundle-analyzer
```

### Production Environment Setup

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Environment variables setup
vercel env add OPENROUTER_API_KEY
vercel env add SITE_URL
vercel env add NODE_ENV production

# Deploy
vercel --prod
```

#### Netlify Deployment
```bash
# Build command: npm run build
# Publish directory: .next

# Environment variables in Netlify dashboard:
OPENROUTER_API_KEY=your_key
SITE_URL=https://your-site.netlify.app
NODE_ENV=production
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=dependencies /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
```

## Error Handling Validation

### Environment Error Scenarios

#### Missing API Key
**Test**: Remove OPENROUTER_API_KEY from environment
**Expected**: Game works with fallback descriptions, no user-visible errors
**Validation**: Navigate to debug URLs, verify graceful degradation

#### Invalid Site URL
**Test**: Set SITE_URL to invalid format
**Expected**: Application fails to start with clear error message
**Validation**: Check startup logs for appropriate error handling

#### Network Connectivity
**Test**: Block outbound API requests
**Expected**: Fallback to cached/hardcoded data, no UI breakage
**Validation**: Use browser dev tools to simulate offline mode

### Monitoring and Alerting

#### Production Monitoring Setup
```typescript
// src/lib/monitoring.ts
export interface MonitoringEvent {
  type: 'error' | 'performance' | 'usage';
  timestamp: number;
  data: Record<string, any>;
}

export function logEvent(event: MonitoringEvent) {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service (Sentry, DataDog, etc.)
    console.log('Monitoring event:', event);
  } else {
    console.log('DEV monitoring event:', event);
  }
}

// Usage tracking
export function trackAPIUsage(endpoint: string, success: boolean, latency: number) {
  logEvent({
    type: 'usage',
    timestamp: Date.now(),
    data: { endpoint, success, latency }
  });
}

// Error tracking
export function trackError(error: Error, context: Record<string, any>) {
  logEvent({
    type: 'error',
    timestamp: Date.now(),
    data: { error: error.message, stack: error.stack, context }
  });
}
```

## Environment-Specific Configuration

### Development Configuration
```json
{
  "name": "chrondle-dev",
  "debug": true,
  "apiTimeout": 10000,
  "cacheEnabled": false,
  "logLevel": "debug"
}
```

### Production Configuration
```json
{
  "name": "chrondle-prod",
  "debug": false,
  "apiTimeout": 5000,
  "cacheEnabled": true,
  "logLevel": "error"
}
```

## Security Validation

### Environment Security Checklist
- [ ] **API Keys**: Not committed to version control
- [ ] **Environment Variables**: Properly scoped (dev vs prod)
- [ ] **HTTPS**: Enforced in production
- [ ] **Headers**: Security headers configured
- [ ] **Dependencies**: No known vulnerabilities (`npm audit`)
- [ ] **Build Process**: Clean, reproducible builds
- [ ] **Access Control**: Proper deployment permissions

### Security Commands
```bash
# Check for security vulnerabilities
npm audit

# Check for exposed secrets
git log --all --grep="password\|key\|secret" -i

# Verify HTTPS in production
curl -I https://yourdomain.com
```

## Troubleshooting Guide

### Common Environment Issues

#### Issue: Build fails with TypeScript errors
**Solution**: Verify TypeScript version, check tsconfig.json configuration

#### Issue: Environment variables not loading
**Solution**: Check .env.local syntax, verify Next.js environment variable prefix

#### Issue: API calls failing in production
**Solution**: Verify OPENROUTER_API_KEY is set, check CORS configuration

#### Issue: Performance degradation in production
**Solution**: Check bundle size, verify caching headers, monitor API response times

### Environment Debugging Commands
```bash
# Check environment variables
printenv | grep -E "(OPENROUTER|SITE_URL|NODE_ENV)"

# Verify Next.js configuration
npx next info

# Check production build
npm run build && npm run start

# Test API connectivity
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models
```

## Validation Automation

### CI/CD Pipeline Integration
```yaml
# .github/workflows/validate.yml
name: Environment Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm audit
      - name: Environment validation
        run: |
          echo "Checking required files..."
          test -f package.json
          test -f next.config.ts
          test -f tsconfig.json
```

---

This comprehensive environment validation ensures Chrondle is production-ready with proper configuration management, error handling, and deployment processes.