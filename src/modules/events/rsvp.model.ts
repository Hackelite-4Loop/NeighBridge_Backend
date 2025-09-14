import mongoose, { Document, Schema } from 'mongoose';

export enum RSVPStatus {
  going = 'going',
  maybe = 'maybe',
  notGoing = 'notGoing',
}

export interface IRSVP extends Document {
  rsvpId: string;
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  status: RSVPStatus;
  createdAt: Date;
  updatedAt: Date;
}

const RSVPSchema = new Schema<IRSVP>({
  rsvpId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  eventId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  status: { 
    type: String, 
    enum: Object.values(RSVPStatus), 
    required: true 
  }
}, { 
  timestamps: true 
});

// Create compound index to prevent duplicate RSVPs
RSVPSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const RSVP = mongoose.model<IRSVP>('RSVP', RSVPSchema);
