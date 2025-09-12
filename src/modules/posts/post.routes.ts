import { Router } from 'express';
import { PostController } from './post.controller';
import { authMiddleware } from '../../middleware/auth';
import { body } from 'express-validator';
import { validateRequest } from '../../middleware/validation';

const postRoutes = Router();

// Validation for creating a post
const validateCreatePost = [
	body('title').isString().isLength({ min: 3, max: 100 }).withMessage('Title is required (3-100 chars)'),
	body('content').isString().isLength({ min: 5 }).withMessage('Content is required'),
	body('communityId').isString().withMessage('communityId is required'),
	body('type').optional().isIn(['general', 'issue', 'event']),
	body('imageUrls').optional().isArray(),
	validateRequest
];

// Create post
postRoutes.post('/', authMiddleware, validateCreatePost, PostController.createPost);

// List posts (optionally by community or type)
postRoutes.get('/', PostController.listPosts);

// Like/Unlike a post
postRoutes.post('/:postId/like', authMiddleware, PostController.toggleLike);

// Add a comment to a post
postRoutes.post('/:postId/comments', authMiddleware, PostController.addComment);

// Get comments for a post
postRoutes.get('/:postId/comments', PostController.getComments);

// Delete a comment
postRoutes.delete('/comments/:commentId', authMiddleware, PostController.deleteComment);

export default postRoutes;
