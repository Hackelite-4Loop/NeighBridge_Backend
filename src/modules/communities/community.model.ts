import mongoose, { Document, Schema } from 'mongoose';

// Community interface
export interface ICommunity extends Document {
  communityId: string;
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  centerLat: number;
  centerLng: number;
  radius: number; // in meters
  status: 'active' | 'suspended';
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Community schema with geospatial indexing
const CommunitySchema = new Schema<ICommunity>({
  communityId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // GeoJSON for MongoDB geospatial queries
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  // Separate lat/lng for easier access
  centerLat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  centerLng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  radius: {
    type: Number,
    required: true,
    min: 100, // minimum 100 meters
    max: 50000 // maximum 50km
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  memberCount: {
    type: Number,
    default: 1 // Creator is automatically a member
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
CommunitySchema.index({ location: '2dsphere' });

// Create text index for search functionality
CommunitySchema.index({ 
  name: 'text', 
  description: 'text' 
});

// Create compound index for status and location queries
CommunitySchema.index({ status: 1, location: '2dsphere' });

// Virtual for easy access to coordinates
CommunitySchema.virtual('coordinates').get(function() {
  return {
    latitude: this.centerLat,
    longitude: this.centerLng
  };
});

// Method to check if a point is within community radius
CommunitySchema.methods.isWithinRadius = function(lat: number, lng: number): boolean {
  const distance = this.calculateDistance(lat, lng);
  return distance <= this.radius;
};

// Method to calculate distance from community center
CommunitySchema.methods.calculateDistance = function(lat: number, lng: number): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = this.centerLat * Math.PI / 180;
  const φ2 = lat * Math.PI / 180;
  const Δφ = (lat - this.centerLat) * Math.PI / 180;
  const Δλ = (lng - this.centerLng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
};

export const Community = mongoose.model<ICommunity>('Community', CommunitySchema);
