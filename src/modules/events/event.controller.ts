import { Request, Response, NextFunction } from 'express';
import { EventService } from './event.service';
import { IEvent, Event } from './event.model';
import { RSVP, RSVPStatus } from './rsvp.model';
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
				communityId: communityId,
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

	// RSVP to an event
	static async rsvpToEvent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId } = req.user!;
			const { eventId } = req.params;
			const { status } = req.body;

			if (!Object.values(RSVPStatus).includes(status)) {
				return res.status(400).json({
					success: false,
					message: 'Invalid RSVP status'
				});
			}

			// Find the event
			const event = await Event.findById(eventId);
			if (!event) {
				return res.status(404).json({
					success: false,
					message: 'Event not found'
				});
			}

			// Check if user already has an RSVP
			const existingRSVP = await RSVP.findOne({
				userId: new mongoose.Types.ObjectId(mongoId),
				eventId: new mongoose.Types.ObjectId(eventId)
			});

			if (existingRSVP) {
				// Update existing RSVP
				existingRSVP.status = status;
				await existingRSVP.save();
			} else {
				// Create new RSVP
				const rsvpId = `rsvp_${uuidv4()}`;
				const rsvp = new RSVP({
					rsvpId,
					userId: new mongoose.Types.ObjectId(mongoId),
					eventId: new mongoose.Types.ObjectId(eventId),
					status
				});
				await rsvp.save();
			}

			// Update event attendeeIds based on RSVP status
			await EventService.updateEventAttendees(eventId);

			res.json({
				success: true,
				message: 'RSVP updated successfully',
				data: { status }
			});
		} catch (error) {
			next(error);
		}
	}

	// Get RSVP status for an event
	static async getEventRSVPs(req: Request, res: Response, next: NextFunction) {
		try {
			const { eventId } = req.params;
			const { status } = req.query;

			let filter: any = { eventId: new mongoose.Types.ObjectId(eventId) };
			if (status && Object.values(RSVPStatus).includes(status as RSVPStatus)) {
				filter.status = status;
			}

			const rsvps = await RSVP.find(filter)
				.populate('userId', 'name avatar')
				.sort({ createdAt: -1 });

			// Group by status
			const groupedRSVPs = {
				going: rsvps.filter(rsvp => rsvp.status === RSVPStatus.going),
				maybe: rsvps.filter(rsvp => rsvp.status === RSVPStatus.maybe),
				notGoing: rsvps.filter(rsvp => rsvp.status === RSVPStatus.notGoing)
			};

			res.json({
				success: true,
				data: {
					rsvps: groupedRSVPs,
					counts: {
						going: groupedRSVPs.going.length,
						maybe: groupedRSVPs.maybe.length,
						notGoing: groupedRSVPs.notGoing.length,
						total: rsvps.length
					}
				}
			});
		} catch (error) {
			next(error);
		}
	}

	// Get user's RSVP status for an event
	static async getUserRSVPStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { mongoId } = req.user!;
			const { eventId } = req.params;

			const rsvp = await RSVP.findOne({
				userId: new mongoose.Types.ObjectId(mongoId),
				eventId: new mongoose.Types.ObjectId(eventId)
			});

			res.json({
				success: true,
				data: {
					status: rsvp?.status || null,
					hasRSVPed: !!rsvp
				}
			});
		} catch (error) {
			next(error);
		}
	}

	// Get event by ID
	static async getEventById(req: Request, res: Response, next: NextFunction) {
		try {
			const { eventId } = req.params;
			const event = await EventService.getEventById(eventId);
			
			if (!event) {
				return res.status(404).json({
					success: false,
					message: 'Event not found'
				});
			}

			res.json({
				success: true,
				data: event
			});
		} catch (error) {
			next(error);
		}
	}

	// Like/Unlike an event
	static async toggleLike(req: AuthenticatedRequest, res: Response, next: NextFunction) {
		try {
			const { eventId } = req.params;
			const { mongoId } = req.user!;

			// Find the event
			const event = await Event.findById(eventId);
			if (!event) {
				return res.status(404).json({
					success: false,
					message: 'Event not found'
				});
			}

			// Check if user already liked this event
			const existingLike = await Event.findOne({
				_id: eventId,
				likedBy: mongoId
			});

			if (existingLike) {
				// Unlike the event
				await Event.findByIdAndUpdate(eventId, { 
					$pull: { likedBy: mongoId },
					$inc: { likesCount: -1 }
				});
				
				res.json({
					success: true,
					message: 'Event unliked',
					data: { liked: false, likesCount: event.likesCount - 1 }
				});
			} else {
				// Like the event
				await Event.findByIdAndUpdate(eventId, { 
					$addToSet: { likedBy: mongoId },
					$inc: { likesCount: 1 }
				});
				
				res.json({
					success: true,
					message: 'Event liked',
					data: { liked: true, likesCount: event.likesCount + 1 }
				});
			}
		} catch (error) {
			next(error);
		}
	}
}
