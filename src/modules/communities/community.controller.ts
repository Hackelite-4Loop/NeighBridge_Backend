import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { Community, ICommunity } from './community.model';
import { Membership } from './membership.model';
import { User } from '../users/user.model';
import { Post } from '../posts/post.model';
import { Issue } from '../issue/issue.model';
import { Event } from '../events/event.model';
import { LocationService } from '../../services/location.service';

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

      // Validate required fields
      if (!name || !centerLat || !centerLng || !radius) {
        return res.status(400).json({
          success: false,
          message: 'Name, location (lat/lng), and radius are required'
        });
      }

      // Convert to proper types (HTTP sends everything as strings)
      const lat = parseFloat(centerLat);
      const lng = parseFloat(centerLng);
      const radiusNum = parseInt(radius);

      // Validate coordinates using LocationService
      if (!LocationService.validateCoordinates(lat, lng)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates'
        });
      }

      // Validate radius (100m to 50km)
      if (isNaN(radiusNum) || radiusNum < 100 || radiusNum > 50000) {
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
              coordinates: [lng, lat]
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

      // Get location details using reverse geocoding
      const locationDetails = await LocationService.getLocationDetailsWithFallback(
        lat, 
        lng, 
        name.trim()
      );

      // Generate unique community ID
      const communityId = `comm_${uuidv4()}`;

      // Create community with enhanced location data
      const community = new Community({
        communityId,
        name: name.trim(),
        description: description?.trim(),
        createdBy: new mongoose.Types.ObjectId(mongoId), // Convert string to ObjectId
        location: {
          type: 'Point',
          coordinates: [lng, lat] // MongoDB expects [lng, lat]
        },
        centerLat: lat,
        centerLng: lng,
        radius: radiusNum,
        locationName: locationDetails.locationName,
        locationAddress: locationDetails.address,
        locationDetails: {
          city: locationDetails.city,
          state: locationDetails.state,
          country: locationDetails.country,
          postalCode: locationDetails.postalCode
        },
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

  // Get all communities (fallback method)
  static async getAllCommunitiesSimple(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, mongoId } = req.user!;
      
      // Get all active communities
      const communities = await Community.find({
        status: 'active'
      })
      .populate('createdBy', 'name email')
      .limit(100)
      .lean();

      console.log(`🔍 Found ${communities.length} communities (all communities method)`);

      // Check if user is already a member of each community
      const user = await User.findOne({ userId });
      const communitiesWithDetails = await Promise.all(
        communities.map(async (community: any) => {
          let existingMembership = null;
          if (user) {
            existingMembership = await Membership.findOne({
              userId: user._id,
              communityId: community._id
            });
          }

          return {
            ...community,
            distanceFromUser: 0,
            canJoin: true, // Allow joining all communities
            isMember: !!existingMembership,
            membershipStatus: existingMembership?.status
          };
        })
      );

      res.json({
        success: true,
        data: {
          userLocation: { latitude: 0, longitude: 0 },
          communities: communitiesWithDetails,
          isUsingFallbackLocation: true,
          fallbackMessage: 'Showing all active communities'
        }
      });

    } catch (error: any) {
      console.error('❌ Error getting all communities:', error);
      next(error);
    }
  }

  // Get communities near user location
  static async getNearbyCommunities(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, mongoId } = req.user!;
      
      // Get user's location from database
      const user = await User.findOne({ userId }).select('mainLocation');
      let latitude: number;
      let longitude: number;
      let isUsingFallback = false;

      if (!user || !user.mainLocation || 
          user.mainLocation.latitude == null || user.mainLocation.longitude == null ||
          typeof user.mainLocation.latitude !== 'number' || typeof user.mainLocation.longitude !== 'number') {
        // Use fallback location (e.g., city center) when user location is not set or invalid
        // You can customize these coordinates to your app's primary location
        latitude = 40.7128; // New York City coordinates as example
        longitude = -74.0060;
        isUsingFallback = true;
      } else {
        latitude = user.mainLocation.latitude;
        longitude = user.mainLocation.longitude;
      }

      // First, try geospatial query
      let communities = [];
      try {
        communities = await Community.find({
          status: 'active',
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [longitude, latitude]
              },
              $maxDistance: 50000 // 50km - increased radius
            }
          }
        })
        .populate('createdBy', 'name email')
        .limit(50)
        .lean();
      } catch (geoError: any) {
        console.log('⚠️ Geospatial query failed, falling back to simple query:', geoError.message);
        // Fallback: Get all active communities if geospatial query fails
        communities = await Community.find({
          status: 'active'
        })
        .populate('createdBy', 'name email')
        .limit(50)
        .lean();
      }

      // If no communities found with geospatial query, get all active communities
      if (communities.length === 0) {
        console.log('📍 No communities found with geospatial query, getting all active communities');
        communities = await Community.find({
          status: 'active'
        })
        .populate('createdBy', 'name email')
        .limit(50)
        .lean();
      }

      console.log(`🔍 Found ${communities.length} communities for discovery`);

      // Add distance and check if user can join each community
      const communitiesWithDetails = await Promise.all(
        communities.map(async (community: any) => {
          let distance = 0;
          let canJoin = true;

          // Calculate distance if we have valid coordinates
          if (community.centerLat && community.centerLng && 
              typeof community.centerLat === 'number' && typeof community.centerLng === 'number') {
            distance = CommunityController.calculateDistance(
              latitude, longitude,
              community.centerLat, community.centerLng
            );
            canJoin = distance <= community.radius;
          } else {
            // If community doesn't have proper coordinates, allow joining
            canJoin = true;
            distance = 0;
          }

          // Check if user is already a member
          let existingMembership = null;
          if (user) {
            existingMembership = await Membership.findOne({
              userId: user._id,
              communityId: community._id
            });
          }

          return {
            ...community,
            distanceFromUser: Math.round(distance),
            canJoin: canJoin,
            isMember: !!existingMembership,
            membershipStatus: existingMembership?.status
          };
        })
      );

      res.json({
        success: true,
        data: {
          userLocation: { latitude, longitude },
          communities: communitiesWithDetails,
          isUsingFallbackLocation: isUsingFallback,
          fallbackMessage: isUsingFallback ? 'Showing communities from a default location. Update your profile location for personalized results.' : null
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
      const { userId, mongoId } = req.user!;
      // ...
      const memberships = await Membership.find({
        userId: new mongoose.Types.ObjectId(mongoId), // Use mongoId converted to ObjectId
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
      const { userId, mongoId } = req.user!;
      const { communityId } = req.params;

      // Find community by either communityId (UUID) or _id (ObjectId)
      let community;
      if (/^[a-f\d]{24}$/i.test(communityId)) {
        // MongoDB ObjectId format
        community = await Community.findOne({ 
          _id: communityId,
          status: 'active' 
        });
      } else {
        // UUID format
        community = await Community.findOne({ 
          communityId,
          status: 'active' 
        });
      }

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      // Check if user already has membership
      const existingMembership = await Membership.findOne({
        userId: new mongoose.Types.ObjectId(mongoId),
        communityId: community._id
      });

      if (existingMembership) {
        let message = 'You are already a member of this community';
        if (existingMembership.status === 'pending') {
          message = 'Your membership request is pending approval from the community admin';
        }
        
        return res.status(409).json({
          success: false,
          message,
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

      // Create membership with pending status for admin approval
      const membershipId = `memb_${uuidv4()}`;
      const membership = new Membership({
        membershipId,
        userId: new mongoose.Types.ObjectId(mongoId),
        communityId: community._id,
        role: 'member',
        status: 'pending' // Requires admin approval
      });

      await membership.save();

      res.status(201).json({
        success: true,
        message: 'Membership request submitted successfully. Waiting for admin approval.',
        data: {
          membershipId: membership.membershipId,
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt,
          isPending: true
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
      const { userId, mongoId } = req.user!;
      const { communityId } = req.params;

      // Find community by either communityId (UUID) or _id (ObjectId)
      let community;
      if (/^[a-f\d]{24}$/i.test(communityId)) {
        // MongoDB ObjectId format
        community = await Community.findOne({ _id: communityId });
      } else {
        // UUID format
        community = await Community.findOne({ communityId });
      }
      
      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      const membership = await Membership.findOne({
        userId: new mongoose.Types.ObjectId(mongoId),
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

      res.json({
        success: true,
        message: 'Successfully left community'
      });

    } catch (error: any) {
      console.error('❌ Error leaving community:', error);
      next(error);
    }
  }

  // Get pending membership requests for a community (admin only)
  static async getPendingRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, mongoId } = req.user!;
      const { communityId } = req.params;

      // Find community by either communityId (UUID) or _id (ObjectId)
      let community;
      if (/^[a-f\d]{24}$/i.test(communityId)) {
        community = await Community.findOne({ _id: communityId });
      } else {
        community = await Community.findOne({ communityId });
      }

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      // Check if user is admin of this community
      const adminMembership = await Membership.findOne({
        userId: new mongoose.Types.ObjectId(mongoId),
        communityId: community._id,
        role: 'communityAdmin',
        status: 'active'
      });

      if (!adminMembership) {
        return res.status(403).json({
          success: false,
          message: 'Only community admins can view pending requests'
        });
      }

      // Get pending membership requests
      const pendingRequests = await Membership.find({
        communityId: community._id,
        status: 'pending'
      })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: {
          community: {
            communityId: community.communityId,
            name: community.name
          },
          pendingRequests: pendingRequests.map(request => ({
            membershipId: request.membershipId,
            user: request.userId,
            requestedAt: (request as any).createdAt,
            role: request.role
          }))
        }
      });

    } catch (error: any) {
      console.error('❌ Error getting pending requests:', error);
      next(error);
    }
  }

  // Approve or reject a membership request (admin only)
  static async handleMembershipRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, mongoId } = req.user!;
      const { communityId, membershipId } = req.params;
      const { action } = req.body; // 'approve' or 'reject'

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Action must be either "approve" or "reject"'
        });
      }

      // Find community
      let community;
      if (/^[a-f\d]{24}$/i.test(communityId)) {
        community = await Community.findOne({ _id: communityId });
      } else {
        community = await Community.findOne({ communityId });
      }

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      // Check if user is admin of this community
      const adminMembership = await Membership.findOne({
        userId: new mongoose.Types.ObjectId(mongoId),
        communityId: community._id,
        role: 'communityAdmin',
        status: 'active'
      });

      if (!adminMembership) {
        return res.status(403).json({
          success: false,
          message: 'Only community admins can handle membership requests'
        });
      }

      // Find the pending membership request
      const membership = await Membership.findOne({
        membershipId,
        communityId: community._id,
        status: 'pending'
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          message: 'Pending membership request not found'
        });
      }

      if (action === 'approve') {
        // Approve the membership
        membership.status = 'active';
        membership.approvedBy = new mongoose.Types.ObjectId(mongoId);
        membership.approvedAt = new Date();
        await membership.save();

        // Update community member count
        await Community.findByIdAndUpdate(community._id, {
          $inc: { memberCount: 1 }
        });

        res.json({
          success: true,
          message: 'Membership request approved successfully',
          data: {
            membershipId: membership.membershipId,
            status: membership.status,
            approvedAt: membership.approvedAt
          }
        });
      } else {
        // Reject the membership
        await Membership.findByIdAndDelete(membership._id);

        res.json({
          success: true,
          message: 'Membership request rejected'
        });
      }

    } catch (error: any) {
      console.error('❌ Error handling membership request:', error);
      next(error);
    }
  }

  // Get community members
  static async getCommunityMembers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const { page = 1, limit = 20, role } = req.query;

      // Find community by either communityId (UUID) or _id (ObjectId)
      let community;
      if (/^[a-f\d]{24}$/i.test(communityId)) {
        community = await Community.findOne({ _id: communityId });
      } else {
        community = await Community.findOne({ communityId });
      }

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      // Build filter for memberships
      let filter: any = { 
        communityId: community._id,
        status: 'active'
      };

      // Filter by role if specified
      if (role) {
        filter.role = role;
      }

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Get memberships with user details
      const memberships = await Membership.find(filter)
        .populate('userId', 'name email avatar role status')
        .sort({ joinedAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Get total count
      const total = await Membership.countDocuments(filter);

      // Format response
      const members = memberships.map(membership => {
        const user = membership.userId as any;
        return {
          membershipId: membership.membershipId,
          role: membership.role,
          joinedAt: membership.joinedAt,
          user: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            status: user.status
          }
        };
      });

      res.json({
        success: true,
        data: {
          community: {
            communityId: community.communityId,
            name: community.name,
            memberCount: community.memberCount
          },
          members,
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
      console.error('❌ Error getting community members:', error);
      next(error);
    }
  }

  // Get community statistics
  static async getCommunityStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;

      // Find community by either communityId (UUID) or _id (ObjectId)
      let community;
      if (/^[a-f\d]{24}$/i.test(communityId)) {
        community = await Community.findOne({ _id: communityId });
      } else {
        community = await Community.findOne({ communityId });
      }

      if (!community) {
        return res.status(404).json({
          success: false,
          message: 'Community not found'
        });
      }

      // Use imported models for counting

      // Get counts for posts, issues, and events in this community
      const [postsCount, issuesCount, eventsCount, membersCount] = await Promise.all([
        Post.countDocuments({ communityId: community.communityId }),
        Issue.countDocuments({ communityId: community.communityId }),
        Event.countDocuments({ communityId: community.communityId }),
        Membership.countDocuments({ communityId: community._id, status: 'active' })
      ]);

      res.json({
        success: true,
        data: {
          community: {
            communityId: community.communityId,
            name: community.name,
            description: community.description,
            memberCount: membersCount,
            createdAt: community.createdAt
          },
          stats: {
            postsCount,
            issuesCount,
            eventsCount,
            membersCount,
            totalActivity: postsCount + issuesCount + eventsCount
          }
        }
      });

    } catch (error: any) {
      console.error('❌ Error getting community stats:', error);
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
