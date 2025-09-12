import { Router } from 'express';
import { IssueController } from './Issue.controller';
import { authMiddleware } from '../../middleware/auth';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../../middleware/validation';

const issueRoutes = Router();

// Validation for creating an issue
const validateCreateIssue = [
	body('title').isString().isLength({ min: 3, max: 100 }).withMessage('Title is required (3-100 chars)'),
	body('content').isString().isLength({ min: 5 }).withMessage('Content is required'),
	body('communityId').isString().withMessage('communityId is required'),
	body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
	body('location').optional().isString(),
	body('imageUrls').optional().isArray(),
	validateRequest
];

// Validation for updating priority
const validateUpdatePriority = [
	body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
	validateRequest
];

// Validation for updating status
const validateUpdateStatus = [
	body('status').isIn(['open', 'inProgress', 'resolved', 'closed']).withMessage('Invalid status'),
	validateRequest
];

// Validation for issue ID parameter
const validateIssueId = [
	param('issueId').isString().withMessage('Invalid issue ID'),
	validateRequest
];

// Create issue
issueRoutes.post('/', authMiddleware, validateCreateIssue, IssueController.createIssue);

// List issues (optionally by community)
issueRoutes.get('/', IssueController.listIssues);

// Get issue by ID
issueRoutes.get('/:issueId', validateIssueId, IssueController.getIssueById);

// Update issue priority
issueRoutes.patch('/:issueId/priority', authMiddleware, validateIssueId, validateUpdatePriority, IssueController.updatePriority);

// Update issue status
issueRoutes.patch('/:issueId/status', authMiddleware, validateIssueId, validateUpdateStatus, IssueController.updateStatus);

export default issueRoutes;
