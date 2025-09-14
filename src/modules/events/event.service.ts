import { Event, IEvent } from './event.model';
import { RSVP, RSVPStatus } from './rsvp.model';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export class EventService {
	static async createEvent(data: Partial<IEvent>): Promise<IEvent> {
		const eventId = `event_${uuidv4()}`;
		const event = new Event({
			...data,
			eventId,
		});
		await event.save();
		return event;
	}

	static async getEvents(filter: any = {}, options: any = {}): Promise<IEvent[]> {
		return Event.find(filter, null, options).sort({ createdAt: -1 });
	}

	static async getEventById(eventId: string): Promise<IEvent | null> {
		return Event.findOne({ eventId });
	}

	static async updateEventAttendees(eventId: string): Promise<void> {
		// Get all RSVPs for this event with status 'going'
		const goingRSVPs = await RSVP.find({
			eventId: new mongoose.Types.ObjectId(eventId),
			status: RSVPStatus.going
		});

		// Extract user IDs
		const attendeeIds = goingRSVPs.map(rsvp => rsvp.userId.toString());

		// Update the event's attendeeIds
		await Event.findByIdAndUpdate(eventId, {
			attendeeIds
		});
	}

	static async getEventRSVPCounts(eventId: string): Promise<{ going: number; maybe: number; notGoing: number; total: number }> {
		const counts = await RSVP.aggregate([
			{ $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 }
				}
			}
		]);

		const result = { going: 0, maybe: 0, notGoing: 0, total: 0 };
		
		counts.forEach(item => {
			result[item._id as keyof typeof result] = item.count;
			result.total += item.count;
		});

		return result;
	}
}
