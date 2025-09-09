import { Event, IEvent } from './event.model';
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

	// Add more methods as needed (update, delete, etc.)
}
