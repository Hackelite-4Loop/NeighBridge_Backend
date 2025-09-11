import { Router } from 'express';
import { IssueController } from './Issue.controller';
import { authMiddleware } from '../../middleware/auth';
import { body, query } from 'express-validator';
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

// Create issue
issueRoutes.post('/', authMiddleware, validateCreateIssue, IssueController.createIssue);

// List issues (optionally by community)
issueRoutes.get('/', IssueController.listIssues);

export default issueRoutes;
