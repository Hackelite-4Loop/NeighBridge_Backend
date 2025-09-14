import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  commentId: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userImageUrl?: string;
  postId: mongoose.Types.ObjectId;
  parentCommentId?: mongoose.Types.ObjectId; // For nested comments
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  commentId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  content: { 
    type: String, 
    required: true, 
    trim: true 
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userName: { 
    type: String, 
    required: true 
  },
  userImageUrl: { 
    type: String 
  },
  postId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  parentCommentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Comment' 
  },
  likesCount: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

// Create indexes for efficient queries
CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
