import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../middleware/auth';
import { 
  validateUserRegistration,
  validateUserLogin
} from '../../middleware/validation';

const userRoutes = Router();

// Public routes
userRoutes.post('/register', validateUserRegistration, UserController.register);
userRoutes.post('/login', validateUserLogin, UserController.login);
userRoutes.get('/check-email/:email', UserController.checkEmailAvailability);  // New route

// Protected routes
userRoutes.use(authMiddleware); // Apply auth middleware to all routes below
userRoutes.get('/profile', UserController.getProfile);
userRoutes.get('/activity-stats', UserController.getActivityStats);
userRoutes.get('/community-role/:communityId', UserController.getCommunityRole);
userRoutes.put('/profile', UserController.updateProfile);
userRoutes.put('/location', UserController.updateLocation);
userRoutes.get('/nearby', UserController.findNearbyUsers);

// Image upload routes
userRoutes.get('/upload-signature', UserController.getUploadSignature);
userRoutes.put('/avatar', UserController.updateAvatar);

export default userRoutes;