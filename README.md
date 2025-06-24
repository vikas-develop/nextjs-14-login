# NextLogin - Advanced Authentication System

A complete Next.js authentication system with JWT tokens, email verification, password reset, and two-factor authentication (2FA).

## 🚀 Features

- ✅ **JWT Token Authentication** with HTTP-only cookies
- ✅ **Email Verification** with secure token-based verification
- ✅ **Password Reset** via email with time-limited tokens
- ✅ **Two-Factor Authentication (2FA)** with TOTP and backup codes
- ✅ **User Registration & Login** with enhanced security
- ✅ **Protected Routes** both client and server-side
- ✅ **Beautiful UI** with Tailwind CSS
- ✅ **TypeScript** for type safety

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **MongoDB** (local installation or MongoDB Atlas)
- **Authenticator app** (Google Authenticator, Authy, etc.) for 2FA testing

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd nextlogin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. MongoDB Setup

#### Option A: Local MongoDB Installation

```bash
# Install MongoDB on Ubuntu/Debian
sudo apt update
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify MongoDB is running
sudo systemctl status mongodb
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Replace `<password>` and `<dbname>` in the connection string

#### Option C: Docker MongoDB

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or with persistent data
docker run -d -p 27017:27017 -v mongodb_data:/data/db --name mongodb mongo:latest
```

### 4. Environment Setup

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Or create `.env.local` manually with the following variables:

```env
# JWT Secret Key - MUST be changed in production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# Application URL
NEXTAUTH_URL=http://localhost:4000

# Node Environment
NODE_ENV=development

# MongoDB Database URL (Required)
MONGODB_URI=mongodb://localhost:27017/nextlogin

# Email Configuration (Optional for development)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@yourapp.com
```

## ⚙️ Configuration

### JWT Secret

**IMPORTANT**: Change the `JWT_SECRET` to a secure random string in production:

```bash
# Generate a secure secret (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Email Configuration

#### Development Mode
In development, emails are logged to the console instead of being sent. You'll see the email content and verification links in your terminal.

#### Production Mode
For production, configure your SMTP settings:

**Gmail Setup:**
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Use your Gmail address as `SMTP_USER`
4. Use the generated app password as `SMTP_PASS`

**Other Email Providers:**
- **SendGrid**: Use their SMTP settings
- **Mailgun**: Configure with their SMTP credentials
- **AWS SES**: Set up with SES SMTP settings

## 🚀 Running the Application

### Development Server

```bash
# Seed the database with default users (run once)
npm run seed

# Start the development server
npm run dev
```

The application will be available at: `http://localhost:4000`

### Build for Production

```bash
npm run build
npm start
```

## 🧪 Testing the Features

### 1. User Registration
1. Go to `http://localhost:4000/register`
2. Create a new account
3. Check console logs for verification email
4. Click the verification link to verify your email

### 2. Password Reset
1. Go to `http://localhost:4000/forgot-password`
2. Enter your email address
3. Check console logs for reset link
4. Follow the link to reset your password

### 3. Two-Factor Authentication
1. Login to your account
2. Go to dashboard security settings
3. Click "Enable 2FA"
4. Scan the QR code with Google Authenticator or Authy
5. Download and save the backup codes
6. Enter the 6-digit code to verify setup
7. Test login with 2FA enabled

### 4. Login with 2FA
1. Enter email and password
2. System will prompt for 2FA code
3. Enter 6-digit code from authenticator app
4. Or use "backup code" option if needed

## 🔒 Security Features

### Password Security
- **bcrypt hashing** with 12 salt rounds
- **Minimum 6 characters** requirement
- **Password confirmation** validation

### Token Security
- **JWT tokens** with 7-day expiration
- **HTTP-only cookies** to prevent XSS
- **Secure cookies** in production
- **Email verification tokens** expire in 24 hours
- **Password reset tokens** expire in 1 hour

### Two-Factor Authentication
- **TOTP (Time-based One-Time Password)** standard
- **30-second time windows** with 2-step tolerance
- **8 backup codes** for account recovery
- **QR codes** for easy authenticator setup

## 📁 Project Structure

```
nextlogin/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/auth/          # Authentication API routes
│   │   ├── dashboard/         # Protected dashboard
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── forgot-password/   # Password reset request
│   │   └── reset-password/    # Password reset form
│   ├── components/            # React components
│   │   └── TwoFactorSetup.tsx # 2FA setup wizard
│   ├── context/               # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── email.ts          # Email service
│   │   └── twoFactor.ts      # 2FA utilities
│   └── middleware/            # Custom middleware
│       └── auth.ts           # Authentication middleware
├── middleware.ts              # Next.js middleware
└── package.json
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login (with 2FA support)
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Email Verification
- `GET /api/auth/verify-email?token=...` - Verify email address

### Password Reset
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Two-Factor Authentication
- `GET /api/auth/2fa/setup` - Generate 2FA secret and QR code
- `POST /api/auth/2fa/verify` - Verify and enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA

### Protected Routes
- `GET /api/protected/profile` - Example protected API route

## 🎨 Default Users

For testing purposes, the following users are pre-configured:

```javascript
// User 1
Email: test@example.com
Password: password123

// User 2  
Email: admin@example.com
Password: password123
```

## 📚 Dependencies

### Core Dependencies
- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### Authentication & Security
- **jsonwebtoken** - JWT token handling
- **bcryptjs** - Password hashing
- **speakeasy** - TOTP for 2FA
- **qrcode** - QR code generation

### Email
- **nodemailer** - Email sending

## 🚀 Deployment

### Environment Variables for Production

```env
# REQUIRED: Change these for production
JWT_SECRET=<generate-a-secure-64-character-secret>
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production

# Email Configuration (Required for production)
SMTP_HOST=smtp.youremailprovider.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASS=your-secure-password
FROM_EMAIL=noreply@yourdomain.com
```

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

#### Other Platforms
- **Netlify**: Configure build settings and environment variables
- **Railway**: Add environment variables and deploy
- **DigitalOcean**: Use App Platform with proper configurations

### Database Integration

**Current Implementation**: MongoDB with Mongoose

The application now uses MongoDB as the primary database with the following features:
- User authentication and management
- Email verification tokens
- Password reset tokens
- Two-factor authentication secrets and backup codes
- User session tracking

**Alternative Databases** (if you want to switch):
- **PostgreSQL** with Prisma
- **MySQL** with Sequelize or Prisma
- **Supabase** for serverless database

## 🛠️ Customization

### Styling
- Modify `src/app/globals.css` for global styles
- Update Tailwind classes in components
- Customize `tailwind.config.js` for brand colors

### Email Templates
- Edit templates in `src/lib/email.ts`
- Add your brand logo and colors
- Customize email content and styling

### Authentication Logic
- Modify token expiration in `src/lib/auth.ts`
- Add additional user fields as needed
- Customize password requirements

## 🐛 Troubleshooting

### Common Issues

1. **JWT Secret Error**
   - Ensure `JWT_SECRET` is set in `.env.local`
   - Use a secure, long random string

2. **Email Not Sending**
   - Check SMTP credentials
   - Verify email provider settings
   - In development, check console logs

3. **2FA QR Code Not Loading**
   - Ensure all 2FA dependencies are installed
   - Check browser console for errors

4. **Login Issues**
   - Verify user credentials
   - Check if 2FA is enabled and provide token
   - Clear browser cookies and try again

### Getting Help

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed (`npm install`)
4. Test with the pre-configured users first

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Happy coding! 🎉** 