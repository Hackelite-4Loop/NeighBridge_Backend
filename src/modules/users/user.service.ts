import { User, IUser } from './user.model';
import { generateUserId } from '../../utils/helpers';
import { AppError } from '../../middleware/errorHandler';

export class UserService {
  // Create user
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    mainLocation?: {
      latitude: number;
      longitude: number;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    avatar?: string;
  }): Promise<IUser> {
    try {
      const emailLower = userData.email.toLowerCase().trim();
      console.log('✅ Creating new user with email:', emailLower);
      // Note: Email existence check is handled by controller

      // Generate unique userId
      const userId = generateUserId();
      
      // Create user in MongoDB
      const user = new User({
        userId,
        name: userData.name,
        email: emailLower, // Use normalized email
        password: userData.password, // Will be hashed by pre-save middleware
        phone: userData.phone,
        avatar: userData.avatar,
        mainLocation: userData.mainLocation,
        isEmailVerified: false, // Can be verified later via email
        isPhoneVerified: false,
        role: 'user',
        status: 'active',
        joinedCommunities: []
      });

      console.log('💾 Attempting to save user to database...');
      await user.save();
      console.log('✅ User saved successfully with ID:', user._id);
      return user;
    } catch (error: any) {
      console.log('❌ Database save error:', error.code, error.message);
      console.log('❌ Error details:', JSON.stringify(error, null, 2));
      console.log('❌ Error keyValue:', error.keyValue);
      console.log('❌ Error keyPattern:', error.keyPattern);
      
      if (error.message === 'Email already exists') {
        throw error; // Re-throw our custom error
      }
      if (error.code === 11000) {
        console.log('❌ Duplicate key error details:', error.keyValue);
        throw new AppError('Email already exists', 400);
      }
      throw new AppError(`Failed to create user: ${error.message}`, 500);
    }
  }

  // Check email availability (for real-time validation)
  static async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const emailLower = email.toLowerCase().trim();
      const userCount = await User.countDocuments({ email: emailLower });
      return userCount === 0; // true if available, false if taken
    } catch (error: any) {
      throw new AppError(`Failed to check email availability: ${error.message}`, 500);
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ email: email.toLowerCase() });
    } catch (error: any) {
      throw new AppError(`Failed to get user: ${error.message}`, 500);
    }
  }

  // Get user by userId
  static async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ userId });
    } catch (error: any) {
      throw new AppError(`Failed to get user: ${error.message}`, 500);
    }
  }

  // Update user
  static async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.password;
      delete updateData.email;
      delete updateData.userId;
      delete updateData.role;
      
      const user = await User.findOneAndUpdate(
        { userId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );
      
      return user;
    } catch (error: any) {
      throw new AppError(`Failed to update user: ${error.message}`, 500);
    }
  }

  // Update user location
  static async updateUserLocation(
    userId: string, 
    location: { 
      latitude: number; 
      longitude: number; 
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    }
  ): Promise<IUser | null> {
    try {
      const user = await User.findOneAndUpdate(
        { userId },
        { 
          mainLocation: location,
          updatedAt: new Date()
        },
        { new: true }
      );
      
      return user;
    } catch (error: any) {
      throw new AppError(`Failed to update user location: ${error.message}`, 500);
    }
  }

  // Find nearby users
  static async findNearbyUsers(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5,
    excludeUserId?: string
  ): Promise<IUser[]> {
    try {
      const query: any = {
        status: 'active',
        mainLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusKm * 1000 // Convert km to meters
          }
        }
      };
      
      if (excludeUserId) {
        query.userId = { $ne: excludeUserId };
      }
      
      return await User.find(query).limit(50);
    } catch (error: any) {
      throw new AppError(`Failed to find nearby users: ${error.message}`, 500);
    }
  }

  // Delete user (soft delete)
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await User.findOneAndUpdate(
        { userId },
        { 
          status: 'inactive',
          updatedAt: new Date()
        }
      );
      
      return !!result;
    } catch (error: any) {
      throw new AppError(`Failed to delete user: ${error.message}`, 500);
    }
  }
}

export default UserService;
