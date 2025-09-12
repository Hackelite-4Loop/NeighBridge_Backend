import { Router } from 'express';
import { EventController } from './event.controller';
import { authMiddleware } from '../../middleware/auth';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../../middleware/validation';

const eventRoutes = Router();

// Validation for creating an event
const validateCreateEvent = [
	body('title').isString().isLength({ min: 3, max: 100 }).withMessage('Title is required (3-100 chars)'),
	body('content').isString().isLength({ min: 5 }).withMessage('Content is required'),
	body('eventDate').isISO8601().withMessage('Event date is required and must be a valid date'),
	body('eventLocation').isString().withMessage('Event location is required'),
	body('maxAttendees').isInt({ min: 1 }).withMessage('Max attendees is required and must be a positive integer'),
	body('communityId').isString().withMessage('communityId is required'),
	body('imageUrls').optional().isArray(),
	validateRequest
];

// Validation for RSVP
const validateRSVP = [
	body('status').isIn(['going', 'maybe', 'notGoing']).withMessage('Invalid RSVP status'),
	validateRequest
];

// Validation for event ID parameter
const validateEventId = [
	param('eventId').isMongoId().withMessage('Invalid event ID'),
	validateRequest
];

// Create event
eventRoutes.post('/', authMiddleware, validateCreateEvent, EventController.createEvent);

// List events (optionally by community)
eventRoutes.get('/', EventController.listEvents);

// Get event by ID
eventRoutes.get('/:eventId', validateEventId, EventController.getEventById);

// RSVP to an event
eventRoutes.post('/:eventId/rsvp', authMiddleware, validateEventId, validateRSVP, EventController.rsvpToEvent);

// Get RSVPs for an event
eventRoutes.get('/:eventId/rsvps', validateEventId, EventController.getEventRSVPs);

// Get user's RSVP status for an event
eventRoutes.get('/:eventId/rsvp-status', authMiddleware, validateEventId, EventController.getUserRSVPStatus);

// Like/Unlike an event
eventRoutes.post('/:eventId/like', authMiddleware, EventController.toggleLike);

export default eventRoutes;
