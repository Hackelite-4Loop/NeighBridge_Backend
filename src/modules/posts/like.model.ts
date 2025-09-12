import mongoose, { Document, Schema } from 'mongoose';

export interface ILike extends Document {
  likeId: string;
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>({
  likeId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  }
}, { 
  timestamps: true 
});

// Create compound index to prevent duplicate likes
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
