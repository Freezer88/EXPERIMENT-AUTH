import { Router } from 'express';
import { UserController } from './user.controller';
import { validateRequest } from '../common/validation/validator';
import { 
  userRegistrationSchema, 
  userLoginSchema,
  userProfileUpdateSchema, 
  passwordChangeSchema,
  passwordResetRequestSchema,
  passwordResetSchema
} from '../common/validation/schemas';
import { 
  authenticateToken, 
  requireAdmin
} from '../../middlewares/auth.middleware';

const router = Router();
const userController = new UserController();

// Public routes
router.post('/register', 
  validateRequest(userRegistrationSchema), 
  userController.register
);

router.post('/login', 
  validateRequest(userLoginSchema), 
  userController.login
);

router.get('/verify-email/:token', 
  userController.verifyEmail
);

router.post('/forgot-password', 
  validateRequest(passwordResetRequestSchema), 
  userController.requestPasswordReset
);

router.post('/reset-password', 
  validateRequest(passwordResetSchema), 
  userController.resetPassword
);

// Protected routes (require authentication)
router.get('/profile', 
  authenticateToken, 
  userController.getProfile
);

router.put('/profile', 
  authenticateToken, 
  validateRequest(userProfileUpdateSchema), 
  userController.updateProfile
);

router.put('/change-password', 
  authenticateToken, 
  validateRequest(passwordChangeSchema), 
  userController.changePassword
);

// Admin routes (require admin role) - commented out for now
// router.get('/stats', 
//   authenticateToken, 
//   requireAdmin, 
//   userController.getUserStats
// );

// router.get('/search', 
//   authenticateToken, 
//   requireAdmin, 
//   userController.searchUsers
// );

// router.delete('/:id', 
//   authenticateToken, 
//   requireAdmin, 
//   userController.deleteUser
// );

// router.put('/:id/reactivate', 
//   authenticateToken, 
//   requireAdmin, 
//   userController.reactivateUser
// );

export default router; 