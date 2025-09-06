import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../modules/users/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as string;
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as string;

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  sub?: string;
}

export class JWTUtils {
  // Generate access token
  static generateAccessToken(user: IUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'sub'> = {
      userId: user.userId,
      email: user.email,
      role: user.role
    };

    const options: SignOptions = {
      expiresIn: JWT_EXPIRES_IN as any,
      issuer: 'neighbridge-api',
      subject: user.userId
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }

  // Generate refresh token
  static generateRefreshToken(user: IUser): string {
    const payload = {
      userId: user.userId,
      type: 'refresh'
    };

    const options: SignOptions = {
      expiresIn: JWT_REFRESH_EXPIRES_IN as any,
      issuer: 'neighbridge-api',
      subject: user.userId
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }

  // Verify access token
  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): any {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return payload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Generate token pair
  static generateTokenPair(user: IUser) {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
      expiresIn: JWT_EXPIRES_IN
    };
  }
}
