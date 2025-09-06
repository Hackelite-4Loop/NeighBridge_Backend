// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { JWTUtils } from '../utils/jwt';
import { UserService } from '../modules/users/user.service';
import { errorResponse } from '../utils/helpers';
import { IUser } from '../modules/users/user.model';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    mongoId: string; // MongoDB ObjectId as string
    email: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    const decoded = JWTUtils.verifyAccessToken(token);
    
    if (!decoded) {
      return errorResponse(res, 'Invalid token', 401);
    }
    
    // Get user from MongoDB
    const user = await UserService.getUserById(decoded.userId);
    
    if (!user || user.status !== 'active') {
      return errorResponse(res, 'User not found or inactive', 401);
    }

    // Add user info to request
    req.user = {
      userId: user.userId,
      mongoId: (user as any)._id.toString(), // Add MongoDB ObjectId as string
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Invalid token', 401);
  }
};

// Admin only middleware
export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403);
  }
  next();
};