import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Generate unique user ID
export const generateUserId = (): string => {
  return `user_${uuidv4().replace(/-/g, '')}`;
};

// Success response helper
export const successResponse = (res: Response, data: any, statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    timestamp: new Date().toISOString(),
    ...data
  });
};

// Error response helper
export const errorResponse = (res: Response, message: string, statusCode: number = 400) => {
  return res.status(statusCode).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: {
      message: message
    }
  });
};
