import mongoose, { Document, Schema } from 'mongoose';

export enum PostType {
	general = 'general',
	issue = 'issue',
	event = 'event',
}

export interface IPost extends Document {
	postId: string;
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
	type: PostType;
}

const PostSchema = new Schema<IPost>({
	postId: { type: String, required: true, unique: true },
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
	type: { type: String, enum: Object.values(PostType), default: PostType.general },
}, { timestamps: true });

export const Post = mongoose.model<IPost>('Post', PostSchema);
