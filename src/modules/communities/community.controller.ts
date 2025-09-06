import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Community, ICommunity } from './community.model';
import { Membership } from './membership.model';
import { User } from '../users/user.model';

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    mongoId: string; // MongoDB ObjectId as string
    email: string;
    role: string;
  };
}

export class CommunityController {
  
  // Create a new community
  static async createCommunity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, mongoId } = req.user!;
      const { name, description, centerLat, centerLng, radius } = req.body;

      console.log('📍 Creating community:', { name, centerLat, centerLng, radius });

      // Validate required fields
      if (!name || !centerLat || !centerLng || !radius) {
        return res.status(400).json({
          success: false,
          message: 'Name, location (lat/lng), and radius are required'
        });
      }

      // Validate coordinates
      if (centerLat < -90 || centerLat > 90 || centerLng < -180 || centerLng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }

      // Validate radius (100m to 50km)
      if (radius < 100 || radius > 50000) {
        return res.status(400).json({
          success: false,
          message: 'Radius must be between 100m and 50km'
        });
      }

      // Check if community with same name exists in similar location
      const existingCommunity = await Community.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [centerLng, centerLat]
            },
            $maxDistance: 1000 // 1km radius
          }
        }
      });

      if (existingCommunity) {
        return res.status(409).json({
          success: false,
          message: 'A community with similar name already exists in this area'
        });
      }

      // Generate unique community ID
      const communityId = `comm_${uuidv4()}`;

      // Create community
      const community = new Community({
        communityId,
        name: name.trim(),
        description: description?.trim(),
        createdBy: new mongoose.Types.ObjectId(mongoId), // Convert string to ObjectId
        location: {
          type: 'Point',
          coordinates: [centerLng, centerLat] // MongoDB expects [lng, lat]
        },
        centerLat,
        centerLng,
        radius,
        status: 'active' // Auto-approve for MVP
      });

      await community.save();

      // Create membership for the creator as admin
      const membershipId = `memb_${uuidv4()}`;
      const membership = new Membership({
        membershipId,
        userId: new mongoose.Types.ObjectId(mongoId), // Convert string to ObjectId
        communityId: community._id,
        role: 'communityAdmin',
        status: 'active',
        joinedAt: new Date(),
        approvedBy: new mongoose.Types.ObjectId(mongoId), // Convert string to ObjectId
        approvedAt: new Date()
      });

      await membership.save();

      // Populate creator details
      await community.populate('createdBy', 'name email');

      console.log('✅ Community created successfully:', communityId);

      res.status(201).json({
        success: true,
        message: 'Community created successfully',
        data: {
          community: {
            communityId: community.communityId,
            name: community.name,
            description: community.description,
            createdBy: community.createdBy,
            centerLat: community.centerLat,
            centerLng: community.centerLng,
            radius: community.radius,
            status: community.status,
            memberCount: community.memberCount,
            createdAt: community.createdAt
          },
          membership: {
            membershipId: membership.membershipId,
            role: membership.role,
            status: membership.status,
            joinedAt: membership.joinedAt
          }
        }
      });

    } catch (error: any) {
      console.error('❌ Error creating community:', error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Community ID already exists'
        });
      }
      next(error);
    }
  }

  // Get all communities with optional location-based filtering
  static async getAllCommunities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { 
        lat, 
        lng, 
        maxDistance = 50000, // Default 50km
        search,
        page = 1,
        limit = 20
      } = req.query;

      console.log('🔍 Getting communities with filters:', { lat, lng, maxDistance, search });

      let query: any = { status: 'active' };
      let sort: any = { createdAt: -1 };

      // Add location-based filtering if coordinates provided
      if (lat && lng) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lng as string);

        if (latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180) {
          query.location = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              $maxDistance: parseInt(maxDistance as string)
            }
          };
          sort = {}; // MongoDB $near automatically sorts by distance
          console.log('📍 Using location-based query');
        }
      }

      // Add text search if provided
      if (search) {
        query.$text = { $search: search as string };
        if (!query.location) {
          sort = { score: { $meta: 'textScore' } };
        }
      }

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Execute query
      const communities = await Community.find(query)
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Get total count for pagination
      const total = await Community.countDocuments(query);

      // If user location provided, add distance to each community
      if (lat && lng) {
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        
        communities.forEach((community: any) => {
          community.distanceFromUser = CommunityController.calculateDistance(
            userLat, userLng, 
            community.centerLat, community.centerLng
          );
        });
      }

      console.log(`📊 Found ${communities.length} communities (${total} total)`);

      res.json({
        success: true,
        data: {
          communities,
          pagination: {
            current: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1
          }
        }
      });

    } catch (error: any) {
      console.error('❌ Error getting communities:', error);
      next(error);
    }
  }

  // Get communities near user location
  static async getNearbyCommunities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      
      // Get user's location from database
      const user = await User.findOne({ userId }).select('mainLocation');
      if (!user || !user.mainLocation) {
        return res.status(400).json({
          success: false,
          message: 'User location not found. Please update your location in profile.'
        });
      }

      const { latitude, longitude } = user.mainLocation;
      console.log('📍 Finding communities near user location:', { latitude, longitude });

      // Find communities within 10km of user
      const communities = await Community.find({
        status: 'active',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: 10000 // 10km
          }
        }
      })
      .populate('createdBy', 'name email')
      .limit(50)
      .lean();

      // Add distance and check if user can join each community
      const communitiesWithDetails = await Promise.all(
        communities.map(async (community: any) => {
          const distance = CommunityController.calculateDistance(
            latitude, longitude,
            community.centerLat, community.centerLng
          );

          // Check if user is already a member
          const existingMembership = await Membership.findOne({
            userId: user._id,
            communityId: community._id
          });

          return {
            ...community,
            distanceFromUser: Math.round(distance),
            canJoin: distance <= community.radius,
            isMember: !!existingMembership,
            membershipStatus: existingMembership?.status
          };
        })
      );

      console.log(`🎯 Found ${communitiesWithDetails.length} nearby communities`);

      res.json({
        success: true,
        data: {
          userLocation: { latitude, longitude },
          communities: communitiesWithDetails
        }
      });

    } catch (error: any) {
      console.error('❌ Error getting nearby communities:', error);
      next(error);
    }
  }

  // Get user's communities (where they are members)
  static async getUserCommunities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;

      console.log('👤 Getting communities for user:', userId);

      // Find user's memberships
      const memberships = await Membership.find({
        userId,
        status: 'active'
      })
      .populate({
        path: 'communityId',
        select: 'communityId name description centerLat centerLng radius memberCount createdAt',
        populate: {
          path: 'createdBy',
          select: 'name email'
        }
      })
      .sort({ joinedAt: -1 });

      const communities = memberships.map(membership => {
        const community = membership.communityId as any; // Cast to access populated fields
        return {
          ...community.toObject(),
          membership: {
            membershipId: membership.membershipId,
            role: membership.role,
            joinedAt: membership.joinedAt
          }
        };
      });

      console.log(`📱 User has ${communities.length} communities`);

      res.json({
        success: true,
        data: { communities }
      });

    } catch (error: any) {
      console.error('❌ Error getting user communities:', error);
      next(error);
    }
  }

  // Join a community
  static async joinCommunity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { communityId } = req.params;

      console.log('🤝 User joining community:', { userId, communityId });

      // Find community
      const community = await Community.findOne({ 
        communityId,
        status: 'active' 
      });

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      // Check if user already has membership
      const existingMembership = await Membership.findOne({
        userId,
        communityId: community._id
      });

      if (existingMembership) {
        return res.status(409).json({
          success: false,
          message: 'You are already a member of this community',
          data: { 
            membershipStatus: existingMembership.status,
            role: existingMembership.role
          }
        });
      }

      // Get user location to check if they're within community radius
      const user = await User.findOne({ userId }).select('mainLocation');
      if (user?.mainLocation) {
        const { latitude, longitude } = user.mainLocation;
        const distance = CommunityController.calculateDistance(
          latitude, longitude,
          community.centerLat, community.centerLng
        );

        if (distance > community.radius) {
          return res.status(400).json({
            success: false,
            message: `You are ${Math.round(distance)}m away from this community (max: ${community.radius}m)`,
            data: { 
              userDistance: Math.round(distance),
              maxDistance: community.radius
            }
          });
        }
      }

      // Create membership
      const membershipId = `memb_${uuidv4()}`;
      const membership = new Membership({
        membershipId,
        userId,
        communityId: community._id,
        role: 'member',
        status: 'active' // Auto-approve for MVP
      });

      await membership.save();

      // Update community member count
      await Community.findByIdAndUpdate(community._id, {
        $inc: { memberCount: 1 }
      });

      console.log('✅ User joined community successfully');

      res.status(201).json({
        success: true,
        message: 'Successfully joined community',
        data: {
          membershipId: membership.membershipId,
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt
        }
      });

    } catch (error: any) {
      console.error('❌ Error joining community:', error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'You are already a member of this community'
        });
      }
      next(error);
    }
  }

  // Leave a community
  static async leaveCommunity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId } = req.user!;
      const { communityId } = req.params;

      console.log('👋 User leaving community:', { userId, communityId });

      // Find community and membership
      const community = await Community.findOne({ communityId });
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      const membership = await Membership.findOne({
        userId,
        communityId: community._id
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'You are not a member of this community'
        });
      }

      // Check if user is the creator/admin
      if (membership.role === 'communityAdmin' && community.createdBy.toString() === userId) {
        return res.status(400).json({
          success: false,
          message: 'Community creator cannot leave. Please transfer admin rights first.'
        });
      }

      // Remove membership
      await Membership.findByIdAndDelete(membership._id);

      // Update community member count
      await Community.findByIdAndUpdate(community._id, {
        $inc: { memberCount: -1 }
      });

      console.log('✅ User left community successfully');

      res.json({
        success: true,
        message: 'Successfully left community'
      });

    } catch (error: any) {
      console.error('❌ Error leaving community:', error);
      next(error);
    }
  }

  // Helper method to calculate distance between two points
  static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
}
