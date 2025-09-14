import mongoose, { Document, Schema } from 'mongoose';

export enum PostPriority {
	low = 'low',           // Less Urgent
	medium = 'medium',     // Moderately Urgent  
	high = 'high',         // Urgent
	critical = 'critical', // Extremely Urgent
}

export enum PostStatus {
	open = 'open',
	inProgress = 'inProgress',
	resolved = 'resolved',
	closed = 'closed',
}

export interface IIssue extends Document {
	issueId: string;
	title: string;
	content: string;
	authorId: mongoose.Types.ObjectId;
	authorName: string;
	authorImageUrl?: string;
	communityId: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
	imageUrls: string[];
	likesCount: number;
	commentsCount: number;
	sharesCount: number;
	isLikedByCurrentUser: boolean;
	priority?: PostPriority;
	status?: PostStatus;
	location?: string;
}

const IssueSchema = new Schema<IIssue>({
	issueId: { type: String, required: true, unique: true },
	title: { type: String, required: true, trim: true },
	content: { type: String, required: true },
	authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	authorName: { type: String, required: true },
	authorImageUrl: { type: String },
	communityId: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
	imageUrls: { type: [String], default: [] },
	likesCount: { type: Number, default: 0 },
	commentsCount: { type: Number, default: 0 },
	sharesCount: { type: Number, default: 0 },
	isLikedByCurrentUser: { type: Boolean, default: false },
	priority: { type: String, enum: Object.values(PostPriority), default: PostPriority.medium },
	status: { type: String, enum: Object.values(PostStatus), default: PostStatus.open },
	location: { type: String },
}, { timestamps: true });

export const Issue = mongoose.model<IIssue>('Issue', IssueSchema);
