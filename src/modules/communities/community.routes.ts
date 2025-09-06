import { Router } from 'express';
import { CommunityController } from './community.controller';
import { authMiddleware } from '../../middleware/auth';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../../middleware/validation';

const communityRoutes = Router();

// Validation middleware for creating community
const validateCreateCommunity = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Community name must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('centerLat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('centerLng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('radius')
    .isInt({ min: 100, max: 50000 })
    .withMessage('Radius must be between 100 and 50000 meters'),
  validateRequest
];

// Validation for location queries
const validateLocationQuery = [
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('maxDistance')
    .optional()
    .isInt({ min: 100, max: 100000 })
    .withMessage('Max distance must be between 100 and 100000 meters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validateRequest
];

// Validation for community ID parameter
const validateCommunityId = [
  param('communityId')
    .matches(/^comm_[a-f0-9-]{36}$/)
    .withMessage('Invalid community ID format'),
  validateRequest
];

// Apply authentication to all routes
communityRoutes.use(authMiddleware);

// Community routes
communityRoutes.post('/', validateCreateCommunity, CommunityController.createCommunity);
communityRoutes.get('/', validateLocationQuery, CommunityController.getAllCommunities);
communityRoutes.get('/nearby', CommunityController.getNearbyCommunities);
communityRoutes.get('/my-communities', CommunityController.getUserCommunities);
communityRoutes.post('/:communityId/join', validateCommunityId, CommunityController.joinCommunity);
communityRoutes.delete('/:communityId/leave', validateCommunityId, CommunityController.leaveCommunity);

export default communityRoutes;
