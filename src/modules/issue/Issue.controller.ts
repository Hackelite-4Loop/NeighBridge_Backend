import { Request, Response, NextFunction } from 'express';
import { IssueService } from './issue.service';
import { IIssue, PostPriority, PostStatus } from './issue.model';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
	user?: {
		userId: string;
		mongoId: string;
		email: string;
		role: string;
	};
}

export class IssueController {
	// Create a new issue
	static async createIssue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId, userId } = req.user!;
			const { title, content, priority, location, communityId, imageUrls } = req.body;
			if (!title || !content || !communityId) {
				return res.status(400).json({ success: false, message: 'Title, content, and communityId are required' });
			}
			const issue = await IssueService.createIssue({
				title: title.trim(),
				content,
				authorId: new mongoose.Types.ObjectId(mongoId),
				authorName: req.user?.userId || '',
				communityId: new mongoose.Types.ObjectId(communityId),
				priority: priority || PostPriority.medium,
				location,
				imageUrls: imageUrls || [],
			});
			res.status(201).json({ success: true, data: issue });
		} catch (error) {
			next(error);
		}
	}

	// List issues (optionally filter by communityId)
	static async listIssues(req: Request, res: Response, next: NextFunction) {
		try {
			const { communityId } = req.query;
			const filter: any = {};
			if (communityId) filter.communityId = communityId;
			const issues = await IssueService.getIssues(filter);
			res.json({ success: true, data: issues });
		} catch (error) {
			next(error);
		}
	}
}
