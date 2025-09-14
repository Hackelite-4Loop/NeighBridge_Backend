
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { UserService } from './user.service';
import { JWTUtils } from '../../utils/jwt';
import { AppError } from '../../middleware/errorHandler';
import { successResponse, errorResponse } from '../../utils/helpers';
import { generateUploadSignature, deleteFromCloudinary, extractPublicId } from '../../config/cloudinary';
import { Post } from '../posts/post.model';
import { Issue } from '../issue/issue.model';
import { Event } from '../events/event.model';
import { Community } from '../communities/community.model';
import { Membership } from '../communities/membership.model';

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    mongoId: string; // MongoDB ObjectId as string
    email: string;
    role: string;
  };
}

export class UserController {
  // Register new user
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { 
        email, 
        password,
        name, 
        phone, 
        mainLocation, 
        avatar 
      } = req.body;

      // Check if user already exists
      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return errorResponse(res, 'User with this email already exists', 400);
      }

      // Create user
      const user = await UserService.createUser({
        name,
        email,
        password, // Will be hashed by pre-save middleware
        phone,
        mainLocation,
        avatar
      });

      // Generate JWT tokens
      const tokens = JWTUtils.generateTokenPair(user);

      return successResponse(res, {
        message: 'User registered successfully',
        user: user.getPublicProfile(),
        tokens
      }, 201);

    } catch (error: any) {
      next(error);
    }
  }

  // Check email availability
  static async checkEmailAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return errorResponse(res, 'Email is required', 400);
      }

      const isAvailable = await UserService.checkEmailAvailability(email);
      
      return successResponse(res, {
        email,
        available: isAvailable,
        message: isAvailable ? 'Email is available' : 'Email is already taken'
      });

    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Check if user is active
      if (user.status !== 'active') {
        return errorResponse(res, 'Account is inactive', 403);
      }

      // Generate JWT tokens
      const tokens = JWTUtils.generateTokenPair(user);

      return successResponse(res, {
        message: 'Login successful',
        user: user.getPublicProfile(),
        tokens
      });

    } catch (error) {
      next(error);
    }
  }

  // Get user profile
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!; // From auth middleware

      const user = await UserService.getUserById(userId);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, {
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          mainLocation: user.mainLocation,
          joinedCommunities: user.joinedCommunities,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          role: user.role
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Get user activity statistics
  static async getActivityStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { mongoId } = req.user!;
      const { communityId } = req.query;
      
      // Use imported models
      
      let query: any = { authorId: mongoId };
      
      // If communityId is provided, filter by community
      if (communityId) {
        // Handle communityId - could be UUID or ObjectId
        if (/^[a-f\d]{24}$/i.test(communityId as string)) {
          // It's already an ObjectId
          query.communityId = communityId;
        } else {
          // It's a UUID, find the community to get its ObjectId
          const community = await Community.findOne({ communityId: communityId });
          if (!community) {
            return res.status(404).json({
              success: false,
              message: 'Community not found'
            });
          }
          query.communityId = community._id as mongoose.Types.ObjectId;
        }
      }
      
      // Get counts for posts, issues, and events
      const [postsCount, issuesCount, eventsCount] = await Promise.all([
        Post.countDocuments(query),
        Issue.countDocuments(query),
        Event.countDocuments(query)
      ]);
      
      return successResponse(res, {
        activityStats: {
          postsCount,
          issuesCount,
          eventsCount,
          totalActivity: postsCount + issuesCount + eventsCount,
          communitySpecific: !!communityId
        }
      });
      
    } catch (error) {
      next(error);
    }
  }

  // Get user's role in a specific community
  static async getCommunityRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { mongoId } = req.user!;
      const { communityId } = req.params;
      
      // Use imported models
      
      // Find the community by communityId
      const community = await Community.findOne({ communityId: communityId });
      if (!community) {
        return errorResponse(res, 'Community not found', 404);
      }
      
      // Check if user is a member and get their role from Membership collection
      const membership = await Membership.findOne({
        userId: new mongoose.Types.ObjectId(mongoId),
        communityId: community._id,
        status: 'active'
      });
      
      if (!membership) {
        console.log('📡 User is not a member of community');
        return successResponse(res, {
          isMember: false,
          role: null,
          joinedAt: null,
          communityName: community.name
        });
      }
      
      console.log('📡 Found membership:', {
        userId: membership.userId,
        communityId: membership.communityId,
        role: membership.role,
        status: membership.status
      });
      
      return successResponse(res, {
        isMember: true,
        role: membership.role || 'member',
        joinedAt: membership.joinedAt,
        communityName: community.name
      });
      
    } catch (error) {
      console.error('❌ Error getting community role:', error);
      next(error);
    }
  }

  // Update user profile
  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const updateData = req.body;

      // Remove sensitive fields from update
      delete updateData.email;
      delete updateData.role;
      delete updateData.status;

      const user = await UserService.updateUser(userId, updateData);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, {
        message: 'Profile updated successfully',
        user: {
          userId: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          mainLocation: user.mainLocation
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // Update user location
  static async updateLocation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { latitude, longitude, address, city, state, country } = req.body;

      if (!latitude || !longitude) {
        return errorResponse(res, 'Latitude and longitude are required', 400);
      }

      const user = await UserService.updateUserLocation(userId, {
        latitude,
        longitude,
        address,
        city,
        state,
        country
      });

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, {
        message: 'Location updated successfully',
        location: user.mainLocation
      });

    } catch (error) {
      next(error);
    }
  }

  // Find nearby users
  static async findNearbyUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { radius = 10 } = req.query;

      const currentUser = await UserService.getUserById(userId);
      if (!currentUser) {
        return errorResponse(res, 'User not found', 404);
      }

      if (!currentUser.mainLocation) {
        return errorResponse(res, 'User location not set', 400);
      }

      const nearbyUsers = await UserService.findNearbyUsers(
        currentUser.mainLocation.latitude,
        currentUser.mainLocation.longitude,
        Number(radius),
        userId
      );

      // Return limited info for privacy
      const filteredUsers = nearbyUsers.map((user: any) => ({
        userId: user.userId,
        name: user.name,
        avatar: user.avatar,
        mainLocation: user.mainLocation
      }));

      return successResponse(res, {
        nearbyUsers: filteredUsers,
        count: filteredUsers.length
      });

    } catch (error) {
      next(error);
    }
  }

  // Generate upload signature for profile image
  static async getUploadSignature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const { folder = 'profiles', cloudName, apiKey } = req.query;
      
      console.log('🔍 Upload signature request:', { folder, cloudName, apiKey, userId: req.user.userId });
      
      if (!cloudName || !apiKey) {
        return errorResponse(res, 'Cloud name and API key are required', 400);
      }

      const uploadParams = generateUploadSignature(
        folder as string, 
        req.user.userId,
        cloudName as string,
        apiKey as string
      );

      console.log('📋 Generated upload params:', uploadParams);

      return successResponse(res, {
        message: 'Upload signature generated successfully',
        data: uploadParams
      }, 200);
    } catch (error) {
      console.error('❌ Error generating upload signature:', error);
      next(error);
    }
  }

  // Update user profile with new avatar URL
  static async updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return errorResponse(res, 'User not authenticated', 401);
      }

      const { avatarUrl } = req.body;

      if (!avatarUrl) {
        return errorResponse(res, 'Avatar URL is required', 400);
      }

      // Get current user to check for existing avatar
      const currentUser = await UserService.getUserById(req.user.userId);
      if (!currentUser) {
        return errorResponse(res, 'User not found', 404);
      }

      // Delete old avatar from Cloudinary if exists
      if (currentUser.avatar && currentUser.avatar.includes('cloudinary.com')) {
        try {
          const publicId = extractPublicId(currentUser.avatar);
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.warn('Failed to delete old avatar from Cloudinary:', error);
          // Don't fail the request if old image deletion fails
        }
      }

      // Update user with new avatar URL
      const updatedUser = await UserService.updateUser(req.user.userId, { avatar: avatarUrl });

      return successResponse(res, {
        message: 'Avatar updated successfully',
        data: {
          user: updatedUser?.getPublicProfile()
        }
      }, 200);
    } catch (error) {
      next(error);
    }
  }
}
