import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  userId: string;
  name: string;
  email: string;
  password: string; // Hashed password
  phone?: string;
  avatar?: string;
  mainLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'inactive' | 'banned';
  joinedCommunities: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  getPublicProfile(): Partial<IUser>;
  isNearby(latitude: number, longitude: number, radiusKm?: number): boolean;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    sparse: true,
    index: true
  },
  avatar: {
    type: String,
    default: null
  },
  mainLocation: {
    latitude: {
      type: Number,
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot exceed 100 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  joinedCommunities: [{
    type: Schema.Types.ObjectId,
    ref: 'Community'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create geospatial index for location-based queries
UserSchema.index({ "mainLocation.latitude": 1, "mainLocation.longitude": 1 });
UserSchema.index({ "mainLocation": "2dsphere" });

// Instance method to compare password
UserSchema.methods.comparePassword = async function(password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to get public profile (without sensitive data)
UserSchema.methods.getPublicProfile = function(): Partial<IUser> {
  const userObj = this.toObject();
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.__v;
  
  return userObj;
};

// Instance method to check if user is nearby another location
UserSchema.methods.isNearby = function(latitude: number, longitude: number, radiusKm: number = 5): boolean {
  const earthRadiusKm = 6371;
  const dLat = (latitude - this.mainLocation.latitude) * Math.PI / 180;
  const dLon = (longitude - this.mainLocation.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.mainLocation.latitude * Math.PI / 180) * Math.cos(latitude * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;
  
  return distance <= radiusKm;
};

// Static method to find nearby users
UserSchema.statics.findNearby = function(
  latitude: number, 
  longitude: number, 
  radiusKm: number = 5,
  excludeUserId?: string
) {
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
  
  return this.find(query);
};

export const User = mongoose.model<IUser>('User', UserSchema);
