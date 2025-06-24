# 🚀 Production Deployment Guide

This guide covers everything needed to deploy NextLogin to production with maximum security and reliability.

## 📋 Pre-Deployment Checklist

### Security Requirements
- [ ] Generate secure JWT secret (64+ characters)
- [ ] Configure production email provider
- [ ] Set up SSL/HTTPS certificates
- [ ] Review and update CORS settings
- [ ] Enable security headers
- [ ] Set secure cookie flags
- [ ] Configure rate limiting
- [ ] Review environment variables

### Code Quality
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] ESLint passing with no warnings
- [ ] Build completes successfully
- [ ] No console.log statements in production code
- [ ] Remove debug flags and test data

### Performance
- [ ] Build output optimized
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] Database queries optimized
- [ ] Caching strategy implemented

## 🔒 Security Configuration

### Environment Variables

Create production environment variables:

```env
# CRITICAL: Generate secure values for production
JWT_SECRET=<64-character-secure-random-string>
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production

# Email Provider (Required)
SMTP_HOST=smtp.youremailprovider.com
SMTP_PORT=587
SMTP_USER=your-production-email@yourdomain.com
SMTP_PASS=your-secure-app-password
FROM_EMAIL=noreply@yourdomain.com

# Optional: Additional security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
SESSION_TIMEOUT=604800
```

### Generate Secure JWT Secret

**CRITICAL**: Never use the default JWT secret in production!

```bash
# Method 1: OpenSSL (Recommended)
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Security Headers

Add these headers in production:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ]
  }
}
```

## 🌐 Platform-Specific Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

2. **Configure Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all required variables
   - Set production-specific values

3. **Domain Configuration:**
   - Add custom domain in Vercel dashboard
   - Update `NEXTAUTH_URL` to match domain
   - Verify SSL certificate is active

4. **Production Deployment:**
   ```bash
   vercel --prod
   ```

### Railway

1. **Setup:**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Configure:**
   ```bash
   # Add environment variables
   railway add
   
   # Deploy
   railway up
   ```

3. **Custom Domain:**
   ```bash
   railway domain
   ```

### DigitalOcean App Platform

1. **Create App:**
   - Connect GitHub repository
   - Select branch and build settings
   - Configure environment variables

2. **Build Settings:**
   ```yaml
   name: nextlogin
   services:
   - name: web
     source_dir: /
     github:
       repo: your-username/nextlogin
       branch: main
     run_command: npm start
     build_command: npm run build
     environment_slug: node-js
   ```

### AWS (EC2/Elastic Beanstalk)

1. **Prepare Application:**
   ```bash
   # Create deployment package
   npm run build
   zip -r nextlogin.zip . -x node_modules/\*
   ```

2. **Environment Configuration:**
   ```bash
   # Set environment variables
   eb setenv JWT_SECRET=your-secret NEXTAUTH_URL=https://yourdomain.com
   ```

## 📧 Email Provider Setup

### Gmail (Development/Small Scale)

1. **Enable 2FA:** Go to Google Account settings
2. **Generate App Password:** [Google App Passwords](https://myaccount.google.com/apppasswords)
3. **Configure:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   ```

### SendGrid (Recommended for Production)

1. **Create Account:** [SendGrid](https://sendgrid.com)
2. **Generate API Key:** Settings → API Keys
3. **Configure:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### AWS SES (Enterprise)

1. **Setup SES:** AWS Console → SES
2. **Verify Domain:** Add DNS records
3. **Generate SMTP Credentials**
4. **Configure:**
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-ses-smtp-username
   SMTP_PASS=your-ses-smtp-password
   ```

## 🗄️ Database Migration

Currently using in-memory storage. For production, choose a database:

### Supabase (Recommended for Simplicity)

1. **Setup:**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Client:**
   ```javascript
   // lib/supabase.js
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
   
   export const supabase = createClient(supabaseUrl, supabaseKey)
   ```

3. **Environment Variables:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### PostgreSQL with Prisma

1. **Setup:**
   ```bash
   npm install prisma @prisma/client
   npx prisma init
   ```

2. **Schema:**
   ```prisma
   // prisma/schema.prisma
   model User {
     id                    String    @id @default(cuid())
     email                 String    @unique
     name                  String
     password              String
     emailVerified         Boolean   @default(false)
     emailVerificationToken String?
     emailVerificationExpires DateTime?
     passwordResetToken    String?
     passwordResetExpires  DateTime?
     twoFactorEnabled      Boolean   @default(false)
     twoFactorSecret       String?
     twoFactorBackupCodes  String[]
     createdAt             DateTime  @default(now())
     updatedAt             DateTime  @updatedAt
   }
   ```

3. **Environment:**
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/nextlogin
   ```

## 🚀 Deployment Steps

### 1. Pre-deployment Testing

```bash
# Run full test suite
npm test

# Build and test production build
npm run build
npm start

# Test critical paths
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Environment Setup

```bash
# Create production environment file
cp .env.local .env.production

# Update values for production
# - Change JWT_SECRET
# - Update NEXTAUTH_URL
# - Configure email provider
# - Set NODE_ENV=production
```

### 3. Deploy

```bash
# Build for production
npm run build

# Deploy to your chosen platform
# (commands vary by platform)
```

### 4. Post-deployment Verification

```bash
# Test production endpoints
curl https://yourdomain.com/api/auth/me

# Test email functionality
# Register a new account and verify email works

# Test 2FA functionality
# Enable 2FA and verify QR code generation

# Test password reset
# Request password reset and verify email delivery
```

## 🔍 Health Checks & Monitoring

### Basic Health Check

Create a health check endpoint:

```javascript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
}
```

### Monitoring Setup

1. **Uptime Monitoring:**
   - UptimeRobot
   - Pingdom
   - StatusCake

2. **Error Tracking:**
   - Sentry
   - LogRocket
   - Bugsnag

3. **Performance Monitoring:**
   - Vercel Analytics
   - Google Analytics
   - New Relic

## 🚨 Rollback Plan

### Automated Rollback (Vercel)

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Manual Rollback

1. **Keep Previous Version:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Rollback Process:**
   ```bash
   git checkout v1.0.0
   vercel --prod
   ```

## 📋 Post-Deployment Checklist

### Immediate Verification
- [ ] Application loads successfully
- [ ] Login/registration works
- [ ] Email sending functional
- [ ] 2FA setup works
- [ ] Password reset works
- [ ] All protected routes secured
- [ ] SSL certificate active
- [ ] No console errors

### Within 24 Hours
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify email deliverability
- [ ] Test from different devices/browsers
- [ ] Monitor user feedback
- [ ] Check security headers
- [ ] Verify database connections

### Within 1 Week
- [ ] Review analytics data
- [ ] Check for security vulnerabilities
- [ ] Monitor system performance
- [ ] Update documentation
- [ ] Plan next iteration

## 🆘 Emergency Procedures

### Site Down

1. **Check Status:**
   ```bash
   curl -I https://yourdomain.com
   ```

2. **Quick Rollback:**
   ```bash
   vercel rollback
   ```

3. **Emergency Contact:**
   - Platform support
   - Team members
   - Stakeholders

### Security Incident

1. **Immediate Actions:**
   - Rotate JWT secret
   - Review access logs
   - Disable compromised accounts
   - Update passwords

2. **Investigation:**
   - Check error logs
   - Review user reports
   - Analyze traffic patterns

## 📞 Support Resources

- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)
- **Email Providers:**
  - SendGrid: [sendgrid.com/support](https://sendgrid.com/support)
  - AWS SES: [aws.amazon.com/ses/](https://aws.amazon.com/ses/)

---

**🎉 Congratulations! Your production deployment is complete and secure.** 