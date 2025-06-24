import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import connectDB from './mongodb';
import User, { IUser } from '../models/User';

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

export interface UserData {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLogin?: Date;
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
      emailVerified: decoded.emailVerified,
      twoFactorEnabled: decoded.twoFactorEnabled,
    };
  } catch (error) {
    return null;
  }
}

// Generate secure random token
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Find user by email
export async function findUserByEmail(email: string): Promise<IUser | null> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

// Find user by ID
export async function findUserById(id: string): Promise<UserData | null> {
  try {
    await connectDB();
    const user = await User.findById(id).select('-password -twoFactorSecret -twoFactorBackupCodes -emailVerificationToken -passwordResetToken');
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

// Create user (for registration)
export async function createUser(email: string, name: string, password: string): Promise<UserData | null> {
  try {
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists');
    }
    
    const hashedPassword = await hashPassword(password);
    
    const newUser = new User({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      emailVerified: false,
      twoFactorEnabled: false,
    });
    
    const savedUser = await newUser.save();
    
    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      emailVerified: savedUser.emailVerified,
      twoFactorEnabled: savedUser.twoFactorEnabled,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Generate email verification token
export async function generateEmailVerificationToken(userId: string): Promise<string | null> {
  try {
    await connectDB();
    const token = generateSecureToken();
    
    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });
    
    return token;
  } catch (error) {
    console.error('Error generating email verification token:', error);
    return null;
  }
}

// Verify email verification token
export async function verifyEmailVerificationToken(token: string): Promise<IUser | null> {
  try {
    await connectDB();
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
    
    if (user) {
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying email verification token:', error);
    return null;
  }
}

// Generate password reset token
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      const token = generateSecureToken();
      user.passwordResetToken = token;
      user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating password reset token:', error);
    return null;
  }
}

// Verify password reset token
export async function verifyPasswordResetToken(token: string): Promise<IUser | null> {
  try {
    await connectDB();
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
    
    return user;
  } catch (error) {
    console.error('Error verifying password reset token:', error);
    return null;
  }
}

// Reset password with token
export async function resetPasswordWithToken(token: string, newPassword: string): Promise<boolean> {
  try {
    const user = await verifyPasswordResetToken(token);
    
    if (user) {
      user.password = await hashPassword(newPassword);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}

// Update user 2FA settings
export async function updateUser2FA(userId: string, enabled: boolean, secret?: string, backupCodes?: string[]): Promise<boolean> {
  try {
    await connectDB();
    const updateData: any = {
      twoFactorEnabled: enabled,
    };
    
    if (enabled && secret) {
      updateData.twoFactorSecret = secret;
      updateData.twoFactorBackupCodes = backupCodes || [];
    } else if (!enabled) {
      updateData.twoFactorSecret = undefined;
      updateData.twoFactorBackupCodes = [];
    }
    
    const result = await User.findByIdAndUpdate(userId, updateData);
    return !!result;
  } catch (error) {
    console.error('Error updating user 2FA:', error);
    return false;
  }
}

// Use backup code
export async function useBackupCode(userId: string, code: string): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findById(userId);
    
    if (user && user.twoFactorBackupCodes) {
      const codeIndex = user.twoFactorBackupCodes.findIndex((c: string) => c === code.toUpperCase());
      if (codeIndex > -1) {
        user.twoFactorBackupCodes.splice(codeIndex, 1);
        await user.save();
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error using backup code:', error);
    return false;
  }
}

// Update last login
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await connectDB();
    await User.findByIdAndUpdate(userId, {
      lastLogin: new Date(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

// Get user with sensitive data (for authentication)
export async function getUserForAuth(email: string): Promise<IUser | null> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    console.error('Error getting user for auth:', error);
    return null;
  }
}

// Create default users for development (run once)
export async function createDefaultUsers(): Promise<void> {
  try {
    await connectDB();
    
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Default users already exist, skipping creation');
      return;
    }
    
    const defaultUsers = [
      {
        email: 'test@example.com',
        name: 'Test User',
        password: await hashPassword('password123'),
        emailVerified: true,
      },
      {
        email: 'admin@example.com',
        name: 'Admin User',
        password: await hashPassword('password123'),
        emailVerified: true,
      }
    ];
    
    await User.insertMany(defaultUsers);
    console.log('Default users created successfully');
  } catch (error) {
    console.error('Error creating default users:', error);
  }
}