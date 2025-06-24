import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface JWTPayload extends UserPayload {
  iat: number;
  exp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
}

// Verify JWT token
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (error) {
    return null;
  }
}

// Mock user database - In a real application, replace this with actual database calls
const USERS: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$12$ph6abT41YorBZxoZZnqOUuF4MdDQxNWftr5zyy.H9Mlx9BwbmBBqu', // password123
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2b$12$ph6abT41YorBZxoZZnqOUuF4MdDQxNWftr5zyy.H9Mlx9BwbmBBqu', // password123
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  }
];

// Find user by email
export async function findUserByEmail(email: string) {
  return USERS.find(user => user.email === email) || null;
}

// Find user by ID
export async function findUserById(id: string) {
  const user = USERS.find(user => user.id === id);
  if (!user) return null;
  
  // Return user without password
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

// Create user (for registration)
export async function createUser(email: string, name: string, password: string) {
  const hashedPassword = await hashPassword(password);
  const now = new Date();
  const newUser: User = {
    id: String(USERS.length + 1),
    email,
    name,
    password: hashedPassword,
    emailVerified: false,
    twoFactorEnabled: false,
    createdAt: now,
    updatedAt: now,
  };
  
  USERS.push(newUser);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

// Generate secure random token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate email verification token
export async function generateEmailVerificationToken(userId: string): Promise<string> {
  const token = generateSecureToken();
  const user = USERS.find(u => u.id === userId);
  
  if (user) {
    user.emailVerificationToken = token;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    user.updatedAt = new Date();
  }
  
  return token;
}

// Verify email verification token
export async function verifyEmailVerificationToken(token: string): Promise<User | null> {
  const user = USERS.find(u => 
    u.emailVerificationToken === token && 
    u.emailVerificationExpires && 
    u.emailVerificationExpires > new Date()
  );
  
  if (user) {
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.updatedAt = new Date();
    return user;
  }
  
  return null;
}

// Generate password reset token
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = USERS.find(u => u.email === email);
  
  if (user) {
    const token = generateSecureToken();
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.updatedAt = new Date();
    return token;
  }
  
  return null;
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<User | null> {
  const user = USERS.find(u => 
    u.passwordResetToken === token && 
    u.passwordResetExpires && 
    u.passwordResetExpires > new Date()
  );
  
  return user || null;
}

// Reset password with token
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  const user = await verifyPasswordResetToken(token);
  
  if (user) {
    user.password = await hashPassword(newPassword);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.updatedAt = new Date();
    return true;
  }
  
  return false;
}

// Update user 2FA settings
export async function updateUser2FA(userId: string, enabled: boolean, secret?: string, backupCodes?: string[]): Promise<boolean> {
  const user = USERS.find(u => u.id === userId);
  
  if (user) {
    user.twoFactorEnabled = enabled;
    if (enabled && secret) {
      user.twoFactorSecret = secret;
      user.twoFactorBackupCodes = backupCodes;
    } else if (!enabled) {
      user.twoFactorSecret = undefined;
      user.twoFactorBackupCodes = undefined;
    }
    user.updatedAt = new Date();
    return true;
  }
  
  return false;
}

// Use backup code
export async function useBackupCode(userId: string, code: string): Promise<boolean> {
  const user = USERS.find(u => u.id === userId);
  
  if (user && user.twoFactorBackupCodes) {
    const codeIndex = user.twoFactorBackupCodes.findIndex(c => c === code.toUpperCase());
    if (codeIndex > -1) {
      user.twoFactorBackupCodes.splice(codeIndex, 1);
      user.updatedAt = new Date();
      return true;
    }
  }
  
  return false;
}