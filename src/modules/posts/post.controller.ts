import { Request, Response, NextFunction } from 'express';
import { PostService } from './post.service';
import { IPost, PostType, Post } from './post.model';
import { Like } from './like.model';
import { Comment } from './comment.model';
import { Community } from '../communities/community.model';
import { User } from '../users/user.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

interface AuthenticatedRequest extends Request {
	user?: {
		userId: string;
		mongoId: string;
		email: string;
		role: string;
	};
}

export class PostController {
	// Create a new post
	static async createPost(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId, userId } = req.user!;
			const { title, content, communityId, imageUrls, type } = req.body;
			if (!title || !content || !communityId) {
				return res.status(400).json({ success: false, message: 'Title, content, and communityId are required' });
			}
			
			// Verify community exists
			const community = await Community.findOne({ communityId: communityId });
			if (!community) {
				return res.status(404).json({
					success: false,
					message: 'Community not found'
				});
			}
			
			// Get user details to get the actual name
			const user = await User.findById(mongoId).select('name avatar');
			
			const post = await PostService.createPost({
				title: title.trim(),
				content,
				authorId: new mongoose.Types.ObjectId(mongoId),
				authorName: user?.name || 'Unknown User',
				authorImageUrl: user?.avatar,
				communityId: communityId,
				imageUrls: imageUrls || [],
				type: type || PostType.general,
			});
			res.status(201).json({ success: true, data: post });
		} catch (error) {
			next(error);
		}
	}

	// List posts (optionally filter by communityId or type)
	static async listPosts(req: Request, res: Response, next: NextFunction) {
		try {
			const { communityId, type } = req.query;
			const filter: any = {};
			
			// Handle communityId - could be UUID or ObjectId
			if (communityId) {
				filter.communityId = communityId;
			}
			
			if (type) filter.type = type;
			const posts = await PostService.getPosts(filter);
			res.json({ success: true, data: posts });
		} catch (error) {
			next(error);
		}
	}

	// Like/Unlike a post
	static async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId } = req.user!;
			const { postId } = req.params;

			// Find the post
			const post = await Post.findById(postId);
			if (!post) {
				return res.status(404).json({
					success: false,
					message: 'Post not found'
				});
			}

			// Check if user already liked this post
			const existingLike = await Like.findOne({
				userId: new mongoose.Types.ObjectId(mongoId),
				postId: new mongoose.Types.ObjectId(postId)
			});

			if (existingLike) {
				// Unlike the post
				await Like.findByIdAndDelete(existingLike._id);
				await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
				
				res.json({
					success: true,
					message: 'Post unliked',
					data: { liked: false, likesCount: post.likesCount - 1 }
				});
			} else {
				// Like the post
				const likeId = `like_${uuidv4()}`;
				const like = new Like({
					likeId,
					userId: new mongoose.Types.ObjectId(mongoId),
					postId: new mongoose.Types.ObjectId(postId)
				});
				await like.save();
				await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

				res.json({
					success: true,
					message: 'Post liked',
					data: { liked: true, likesCount: post.likesCount + 1 }
				});
			}
		} catch (error) {
			next(error);
		}
	}

	// Add a comment to a post
	static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId } = req.user!;
			const { postId } = req.params;
			const { content, parentCommentId } = req.body;

			if (!content || !content.trim()) {
				return res.status(400).json({
					success: false,
					message: 'Comment content is required'
				});
			}

			// Find the post
			const post = await Post.findById(postId);
			if (!post) {
				return res.status(404).json({
					success: false,
					message: 'Post not found'
				});
			}

			// Get user details
			const user = await User.findById(mongoId).select('name avatar');
			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found'
				});
			}

			// Create comment
			const commentId = `comment_${uuidv4()}`;
			const comment = new Comment({
				commentId,
				content: content.trim(),
				userId: new mongoose.Types.ObjectId(mongoId),
				userName: user.name,
				userImageUrl: user.avatar,
				postId: new mongoose.Types.ObjectId(postId),
				parentCommentId: parentCommentId ? new mongoose.Types.ObjectId(parentCommentId) : undefined
			});

			await comment.save();
			await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

			res.status(201).json({
				success: true,
				message: 'Comment added successfully',
				data: comment
			});
		} catch (error) {
			next(error);
		}
	}

	// Get comments for a post
	static async getComments(req: Request, res: Response, next: NextFunction) {
		try {
			const { postId } = req.params;
			const { page = 1, limit = 20 } = req.query;

			const skip = (Number(page) - 1) * Number(limit);
			
			const comments = await Comment.find({ postId })
				.populate('userId', 'name avatar')
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(Number(limit));

			const totalComments = await Comment.countDocuments({ postId });

			res.json({
				success: true,
				data: {
					comments,
					pagination: {
						current: Number(page),
						pages: Math.ceil(totalComments / Number(limit)),
						total: totalComments,
						hasNext: skip + comments.length < totalComments,
						hasPrev: Number(page) > 1
					}
				}
			});
		} catch (error) {
			next(error);
		}
	}

	// Delete a comment
	static async deleteComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId } = req.user!;
			const { commentId } = req.params;

			const comment = await Comment.findOne({ commentId });
			if (!comment) {
				return res.status(404).json({
					success: false,
					message: 'Comment not found'
				});
			}

			// Check if user owns the comment
			if (comment.userId.toString() !== mongoId) {
				return res.status(403).json({
					success: false,
					message: 'You can only delete your own comments'
				});
			}

			await Comment.findByIdAndDelete(comment._id);
			await Post.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } });

			res.json({
				success: true,
				message: 'Comment deleted successfully'
			});
		} catch (error) {
			next(error);
		}
	}

}
