import { Request, Response, NextFunction } from 'express';
import { EventService } from './event.service';
import { IEvent } from './event.model';
import mongoose from 'mongoose';

interface AuthenticatedRequest extends Request {
	user?: {
		userId: string;
		mongoId: string;
		email: string;
		role: string;
	};
}

export class EventController {
	// Create a new event
	static async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId, userId } = req.user!;
			const { title, content, eventDate, eventLocation, maxAttendees, communityId, imageUrls } = req.body;
			if (!title || !content || !eventDate || !eventLocation || !maxAttendees || !communityId) {
				return res.status(400).json({ success: false, message: 'Missing required fields' });
			}
			const event = await EventService.createEvent({
				title: title.trim(),
				content,
				authorId: new mongoose.Types.ObjectId(mongoId),
				authorName: req.user?.userId || '',
				communityId: new mongoose.Types.ObjectId(communityId),
				eventDate: new Date(eventDate),
				eventLocation,
				maxAttendees: Number(maxAttendees),
				imageUrls: imageUrls || [],
			});
			res.status(201).json({ success: true, data: event });
		} catch (error) {
			next(error);
		}
	}

	// List events (optionally filter by communityId)
	static async listEvents(req: Request, res: Response, next: NextFunction) {
		try {
			const { communityId } = req.query;
			const filter: any = {};
			if (communityId) filter.communityId = communityId;
			const events = await EventService.getEvents(filter);
			res.json({ success: true, data: events });
		} catch (error) {
			next(error);
		}
	}
}
