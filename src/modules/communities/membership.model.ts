import mongoose, { Document, Schema } from 'mongoose';

// Membership interface
export interface IMembership extends Document {
  membershipId: string;
  userId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  role: 'member' | 'communityAdmin';
  status: 'active' | 'pending' | 'suspended';
  joinedAt: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
}

// Membership schema
const MembershipSchema = new Schema<IMembership>({
  membershipId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  communityId: {
    type: Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'communityAdmin'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'suspended'],
    default: 'active' // For MVP, auto-approve joins
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Ensure unique membership per user per community
MembershipSchema.index({ userId: 1, communityId: 1 }, { unique: true });

// Index for community admin queries
MembershipSchema.index({ communityId: 1, role: 1 });

// Index for user's communities
MembershipSchema.index({ userId: 1, status: 1 });

export const Membership = mongoose.model<IMembership>('Membership', MembershipSchema);
