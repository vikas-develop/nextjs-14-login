# 📜 NPM Scripts & Development Commands

This document describes all available npm scripts and development commands for the NextLogin project.

## 🚀 Available Scripts

### Development Scripts

```bash
# Start development server on port 4000
npm run dev

# Start development server with debug mode
DEBUG=* npm run dev

# Start with specific port (if needed)
PORT=3000 npm run dev
```

### Build Scripts

```bash
# Build for production
npm run build

# Start production server
npm start

# Build and start (combined)
npm run build && npm start
```

### Code Quality Scripts

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint --fix

# Type checking
npx tsc --noEmit
```

### Testing Scripts

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔧 Development Commands

### Environment Management

```bash
# Check environment variables
printenv | grep -E "(JWT_SECRET|NEXTAUTH_URL|NODE_ENV)"

# Validate .env.local file
cat .env.local

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Commands

```bash
# Reset in-memory database (restart server)
# Ctrl+C then npm run dev

# When using real database:
# npx prisma migrate dev
# npx prisma db seed
```

### Debugging Commands

```bash
# Debug specific module
DEBUG=nextauth:* npm run dev

# Debug all modules
DEBUG=* npm run dev

# Check build output
npm run build 2>&1 | tee build.log
```

### Dependency Management

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Audit security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

## 🛠️ Custom Scripts

You can add these custom scripts to your `package.json`:

```json
{
  "scripts": {
    "dev:debug": "DEBUG=* npm run dev",
    "dev:email": "DEBUG=email:* npm run dev",
    "build:analyze": "ANALYZE=true npm run build",
    "clean": "rm -rf .next && rm -rf node_modules && npm install",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test:e2e": "playwright test",
    "db:reset": "echo 'Restarting server to reset in-memory database'",
    "generate:secret": "node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
  }
}
```

## 🔍 Troubleshooting Commands

### Clear Cache and Reset

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Full reset
npm run clean
```

### Check Dependencies

```bash
# List installed packages
npm list --depth=0

# Check specific packages
npm list jsonwebtoken bcryptjs speakeasy

# Verify critical dependencies
npm list | grep -E "(next|react|typescript)"
```

### Verify Installation

```bash
# Check Node.js and npm versions
node --version && npm --version

# Verify project structure
ls -la src/

# Check for required files
ls -la .env.local package.json tsconfig.json
```

### Debug Network Issues

```bash
# Test local server
curl http://localhost:4000/api/auth/me

# Test with verbose output
curl -v http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Check port availability
lsof -i :4000
```

## 🧪 Testing Commands

### Manual API Testing

```bash
# Test registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'

# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Test 2FA setup
curl -X GET http://localhost:4000/api/auth/2fa/setup \
  -H "Cookie: auth-token=your-jwt-token"
```

### Performance Testing

```bash
# Build and analyze bundle size
npm run build
npx @next/bundle-analyzer

# Lighthouse audit
npx lighthouse http://localhost:4000 --view

# Check memory usage
node --inspect npm run dev
```

## 📊 Monitoring Commands

### Development Monitoring

```bash
# Watch file changes
watch -n 1 'find src -name "*.ts" -o -name "*.tsx" | wc -l'

# Monitor server logs
tail -f .next/server.log

# Check server status
ps aux | grep node
```

### Production Health Check

```bash
# Basic health check
curl -f http://localhost:4000/api/auth/me || echo "Server not responding"

# Database connection test
node -e "
const { findUserById } = require('./src/lib/auth');
findUserById('1').then(user => 
  console.log(user ? 'Database OK' : 'Database Error')
);
"
```

## 🚀 Deployment Commands

### Pre-deployment Checks

```bash
# Run full build
npm run build

# Type check
npx tsc --noEmit

# Lint check
npm run lint

# Security audit
npm audit --audit-level moderate
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment logs
vercel logs
```

### Docker Commands (if using Docker)

```bash
# Build Docker image
docker build -t nextlogin .

# Run container
docker run -p 4000:4000 nextlogin

# Run with environment file
docker run --env-file .env.local -p 4000:4000 nextlogin
```

## 🎯 Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |
| `npm audit` | Check security vulnerabilities |
| `npm outdated` | Check for package updates |

## 🆘 Emergency Commands

If something goes wrong:

```bash
# Nuclear option - full reset
rm -rf .next node_modules package-lock.json
npm install
npm run dev

# Check for port conflicts
sudo lsof -i :4000
kill -9 <PID>

# Verify environment
echo $NODE_ENV
cat .env.local | head -5
```

---

**Keep this reference handy for efficient development! 🛠️** 