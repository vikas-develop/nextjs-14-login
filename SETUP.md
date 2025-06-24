# 🚀 NextLogin Setup Guide

This guide will walk you through setting up the complete NextLogin authentication system with all advanced features.

## 📋 Quick Start Checklist

- [ ] Install Node.js (v18+)
- [ ] Clone repository and install dependencies
- [ ] Create `.env.local` file with required variables
- [ ] Run development server
- [ ] Test all features (login, 2FA, password reset, email verification)

## 🛠️ Detailed Setup Instructions

### Step 1: System Requirements

Ensure you have the following installed:

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check Git
git --version
```

### Step 2: Project Installation

```bash
# Clone the repository
git clone <your-repository-url>
cd nextlogin

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 3: MongoDB Setup

Choose one of the following options:

#### Option A: Local MongoDB
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt update && sudo apt install -y mongodb
sudo systemctl start mongodb

# Or install via MongoDB official repository
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Recommended)
1. Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account and cluster
3. Get connection string
4. Replace password and database name

#### Option C: Docker MongoDB
```bash
docker run -d -p 27017:27017 --name nextlogin-mongo -v mongodb_data:/data/db mongo:latest
```

### Step 4: Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Create environment file
touch .env.local
```

Add the following content to `.env.local`:

```env
# ============================================================================
# REQUIRED CONFIGURATION
# ============================================================================

# JWT Secret - Change this to a secure random string
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Application URL
NEXTAUTH_URL=http://localhost:4000

# Environment
NODE_ENV=development

# MongoDB Connection String (Required)
MONGODB_URI=mongodb://localhost:27017/nextlogin

# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextlogin

# ============================================================================
# EMAIL CONFIGURATION (Optional for development)
# ============================================================================

# SMTP Settings (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com
```

### Step 4: Generate Secure JWT Secret

For production, generate a secure JWT secret:

```bash
# Method 1: Using OpenSSL (Linux/Mac)
openssl rand -base64 32

# Method 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online generator
# Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

Copy the generated secret and replace the `JWT_SECRET` value in `.env.local`.

### Step 5: Email Configuration (Optional for Development)

#### Development Mode
In development, emails are logged to the console. You'll see verification links and reset URLs in your terminal output.

#### Production Email Setup

**Option A: Gmail (Recommended for testing)**
1. Enable 2-factor authentication on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password
4. Use your Gmail address as `SMTP_USER`
5. Use the app password as `SMTP_PASS`

**Option B: SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Option C: Mailgun**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

### Step 6: Initialize Database and Start Server

```bash
# Seed the database with default users
npm run seed

# Start the development server
npm run dev

# Server will start at http://localhost:4000
```

### Step 7: Verify Installation

Open your browser and navigate to:
- `http://localhost:4000` - Home page
- `http://localhost:4000/login` - Login page
- `http://localhost:4000/register` - Registration page

## 🧪 Testing All Features

### Test User Registration & Email Verification

1. **Register a new account:**
   - Go to `http://localhost:4000/register`
   - Fill in: Name, Email, Password, Confirm Password
   - Click "Create Account"

2. **Check email verification:**
   - Look at your terminal/console output
   - Find the verification email log
   - Copy the verification URL and paste in browser
   - Verify your email is confirmed

### Test Password Reset

1. **Request password reset:**
   - Go to `http://localhost:4000/forgot-password`
   - Enter your email address
   - Click "Send reset link"

2. **Reset password:**
   - Check terminal for reset email log
   - Copy the reset URL and open in browser
   - Enter new password and confirm
   - Test login with new password

### Test Two-Factor Authentication

1. **Enable 2FA:**
   - Login to your account
   - Go to dashboard
   - Click "Enable 2FA" in Security Settings
   - Install Google Authenticator or Authy on your phone

2. **Setup 2FA:**
   - Scan the QR code with your authenticator app
   - Download and save the backup codes
   - Enter the 6-digit code from your app
   - Click "Verify & Enable"

3. **Test 2FA login:**
   - Logout and login again
   - Enter email and password
   - Enter 6-digit code from authenticator app
   - Test backup code option

### Test Protected Routes

1. **API Protection:**
   - In dashboard, click "Test Protected Route"
   - Should return your user data

2. **Page Protection:**
   - Try accessing `/dashboard` without logging in
   - Should redirect to login page

## 🔧 Advanced Configuration

### Database Integration

Replace the in-memory user storage with a real database:

**Option 1: Prisma + PostgreSQL**
```bash
npm install prisma @prisma/client
npx prisma init
```

**Option 2: MongoDB + Mongoose**
```bash
npm install mongodb mongoose
```

**Option 3: Supabase**
```bash
npm install @supabase/supabase-js
```

### Custom Email Templates

Edit email templates in `src/lib/email.ts`:
- Add your brand logo
- Customize colors and styling
- Add additional content

### Security Enhancements

1. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

2. **CORS Configuration:**
   ```bash
   npm install cors
   ```

3. **Helmet for Security Headers:**
   ```bash
   npm install helmet
   ```

## 🚀 Production Deployment

### Environment Variables for Production

Create production environment variables:

```env
# SECURITY - MUST CHANGE
JWT_SECRET=<64-character-secure-random-string>
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production

# EMAIL - REQUIRED
SMTP_HOST=smtp.youremailprovider.com
SMTP_PORT=587
SMTP_USER=your-production-email@yourdomain.com
SMTP_PASS=your-secure-password
FROM_EMAIL=noreply@yourdomain.com
```

### Vercel Deployment

1. **Prepare for deployment:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   - Connect GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy automatically on push

3. **Vercel environment variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all required variables from your `.env.local`

### Other Deployment Options

**Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
railway add
```

**DigitalOcean App Platform:**
- Create new app from GitHub
- Configure environment variables
- Deploy with automatic builds

## 🔍 Troubleshooting

### Common Issues

1. **"JWT_SECRET is not defined" Error**
   ```bash
   # Solution: Check .env.local file exists and contains JWT_SECRET
   ls -la .env.local
   cat .env.local | grep JWT_SECRET
   ```

2. **Email not sending in development**
   ```bash
   # Solution: Check console logs, emails are logged not sent
   # Look for output starting with "📧 Email would be sent to:"
   ```

3. **2FA QR Code not displaying**
   ```bash
   # Solution: Check browser console for errors
   # Ensure all 2FA dependencies are installed
   npm list speakeasy qrcode
   ```

4. **Login redirects to login page**
   ```bash
   # Solution: Clear browser cookies and localStorage
   # Check JWT token in browser dev tools → Application → Cookies
   ```

5. **Build errors**
   ```bash
   # Solution: Check TypeScript errors
   npm run build 2>&1 | grep error
   
   # Fix common issues
   npm run lint --fix
   ```

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
DEBUG=nextauth:*
LOG_LEVEL=debug
```

### Health Check

Test all endpoints manually:
```bash
# Test authentication endpoint
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test protected endpoint
curl -X GET http://localhost:4000/api/auth/me \
  -H "Cookie: auth-token=your-jwt-token"
```

## 📞 Support

If you encounter issues:

1. **Check the logs:** Console output usually contains helpful error messages
2. **Verify environment:** Ensure all required environment variables are set
3. **Test with default users:** Use `test@example.com` / `password123` first
4. **Clear cache:** Delete `.next` folder and restart: `rm -rf .next && npm run dev`

## 🎯 Next Steps

After successful setup:

- [ ] Customize the UI with your brand colors
- [ ] Set up a production database
- [ ] Configure production email provider
- [ ] Add additional user fields as needed
- [ ] Implement role-based access control
- [ ] Add audit logging
- [ ] Set up monitoring and analytics
- [ ] Create user documentation

---

**You're all set! 🎉 Your advanced authentication system is ready to use.** 