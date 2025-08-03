import { Router } from 'express';
import { accountController } from './account.controller';
import { invitationController } from './invitation.controller';
import { authenticateToken } from '../../middlewares/auth.middleware';
import { 
  requireAccountAccess, 
  requireAccountOwnershipOrAdmin, 
  requireAccountOwnership,
  requirePermission 
} from '../../middlewares/rbac.middleware';
import { PERMISSIONS } from '../../modules/common/security/permissions';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Account creation
router.post('/', accountController.createAccount);

// Get user's accounts
router.get('/', accountController.getAccounts);

// Get specific account
router.get('/:accountId', requireAccountAccess(), accountController.getAccountById);

// Update account
router.put('/:accountId', requireAccountOwnershipOrAdmin(), accountController.updateAccount);

// Delete account
router.delete('/:accountId', requireAccountOwnership(), accountController.deleteAccount);

// Get account members
router.get('/:accountId/members', requireAccountAccess(), accountController.getAccountMembers);

// Invite member
router.post('/:accountId/members/invite', requireAccountOwnershipOrAdmin(), accountController.inviteMember);

// Update member role
router.put('/:accountId/members/:userId/role', requireAccountOwnershipOrAdmin(), accountController.updateMemberRole);

// Remove member
router.delete('/:accountId/members/:userId', requireAccountOwnershipOrAdmin(), accountController.removeMember);

// Account settings
router.put('/:accountId/settings', requireAccountOwnershipOrAdmin(), accountController.updateAccountSettings);

// Invitation routes
router.post('/:accountId/invitations', requireAccountOwnershipOrAdmin(), invitationController.createInvitation);
router.get('/:accountId/invitations', requireAccountAccess(), invitationController.getInvitations);
router.get('/invitations/:token', invitationController.getInvitationByToken);
router.post('/invitations/:token/accept', invitationController.acceptInvitation);
router.delete('/invitations/:invitationId', requireAccountOwnershipOrAdmin(), invitationController.cancelInvitation);
router.post('/invitations/:invitationId/resend', requireAccountOwnershipOrAdmin(), invitationController.resendInvitation);

export { router as accountRoutes }; 