import { Request, Response } from 'express';
import { invitationService } from './invitation.service';
import { CreateInvitationRequest, AcceptInvitationRequest } from './invitation.types';

export class InvitationController {
  async createInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const invitationData: CreateInvitationRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const invitation = await invitationService.createInvitation(accountId, invitationData, userId);

      res.status(201).json({
        success: true,
        invitation,
        message: 'Invitation sent successfully',
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create invitation',
      });
    }
  }

  async getInvitations(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const invitations = await invitationService.getInvitationsForAccount(accountId, userId);

      res.status(200).json({
        success: true,
        invitations,
      });
    } catch (error) {
      console.error('Error getting invitations:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get invitations',
      });
    }
  }

  async getInvitationByToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      const invitation = await invitationService.getInvitationByToken(token);

      if (!invitation) {
        res.status(404).json({
          success: false,
          message: 'Invitation not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        invitation,
      });
    } catch (error) {
      console.error('Error getting invitation:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get invitation',
      });
    }
  }

  async acceptInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { userId }: AcceptInvitationRequest = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      await invitationService.acceptInvitation(token, userId);

      res.status(200).json({
        success: true,
        message: 'Invitation accepted successfully',
      });
    } catch (error) {
      console.error('Error accepting invitation:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to accept invitation',
      });
    }
  }

  async cancelInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { invitationId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await invitationService.cancelInvitation(invitationId, userId);

      res.status(200).json({
        success: true,
        message: 'Invitation cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to cancel invitation',
      });
    }
  }

  async resendInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { invitationId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const invitation = await invitationService.resendInvitation(invitationId, userId);

      res.status(200).json({
        success: true,
        invitation,
        message: 'Invitation resent successfully',
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to resend invitation',
      });
    }
  }
}

export const invitationController = new InvitationController(); 