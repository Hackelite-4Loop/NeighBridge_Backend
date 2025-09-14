import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
	eventId: string;
	title: string;
	content: string;
	authorId: mongoose.Types.ObjectId;
	authorName: string;
	authorImageUrl?: string;
	communityId: string;
	createdAt: Date;
	updatedAt: Date;
	imageUrls: string[];
	likesCount: number;
	commentsCount: number;
	sharesCount: number;
	isLikedByCurrentUser: boolean;
	eventDate: Date;
	eventLocation: string;
	maxAttendees: number;
	attendeeIds: string[];
	likedBy: string[];
}

const EventSchema = new Schema<IEvent>({
	eventId: { type: String, required: true, unique: true },
	title: { type: String, required: true, trim: true },
	content: { type: String, required: true },
	authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	authorName: { type: String, required: true },
	authorImageUrl: { type: String },
	communityId: { type: String, required: true },
	imageUrls: { type: [String], default: [] },
	likesCount: { type: Number, default: 0 },
	commentsCount: { type: Number, default: 0 },
	sharesCount: { type: Number, default: 0 },
	isLikedByCurrentUser: { type: Boolean, default: false },
	eventDate: { type: Date, required: true },
	eventLocation: { type: String, required: true },
	maxAttendees: { type: Number, required: true },
	attendeeIds: { type: [String], default: [] },
	likedBy: { type: [String], default: [] },
}, { timestamps: true });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
