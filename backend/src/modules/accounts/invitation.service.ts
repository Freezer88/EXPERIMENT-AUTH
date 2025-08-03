import { Invitation, CreateInvitationRequest, AcceptInvitationRequest, InvitationStatus } from './invitation.types';
import { AccountRole } from './account.types';
import { accountService } from './account.service';

// Mock database for now - will be replaced with Prisma
class InvitationService {
  private invitations: Invitation[] = [];

  async createInvitation(accountId: string, request: CreateInvitationRequest, invitedBy: string): Promise<Invitation> {
    // Validate account exists and user has permission
    const account = await accountService.getAccountById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if inviter has permission (owner or admin)
    const inviterMembership = await this.getAccountMembership(accountId, invitedBy);
    if (!inviterMembership || (inviterMembership.role !== 'owner' && inviterMembership.role !== 'admin')) {
      throw new Error('Insufficient permissions to invite members');
    }

    // Validate email format
    if (!this.isValidEmail(request.email)) {
      throw new Error('Invalid email format');
    }

    // Check if user is already a member
    const existingMember = await this.getAccountMembership(accountId, request.email);
    if (existingMember) {
      throw new Error('User is already a member of this account');
    }

    // Check if invitation already exists for this email
    const existingInvitation = this.invitations.find(
      inv => inv.accountId === accountId && inv.email === request.email && inv.status === 'pending'
    );
    if (existingInvitation) {
      throw new Error('An invitation already exists for this email');
    }

    // Validate role
    if (!this.isValidRole(request.role)) {
      throw new Error('Invalid role specified');
    }

    // Generate secure invitation token
    const token = this.generateInvitationToken();
    
    // Set expiration (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation: Invitation = {
      id: this.generateId(),
      accountId,
      email: request.email.toLowerCase(),
      role: request.role,
      invitedBy,
      token,
      status: 'pending',
      message: request.message,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.invitations.push(invitation);

    // Send invitation email (mocked for now)
    await this.sendInvitationEmail(invitation, account.name, invitedBy);

    return invitation;
  }

  async getInvitationsForAccount(accountId: string, userId: string): Promise<Invitation[]> {
    // Check if user has access to this account
    const membership = await this.getAccountMembership(accountId, userId);
    if (!membership) {
      throw new Error('Access denied to account');
    }

    return this.invitations.filter(inv => inv.accountId === accountId);
  }

  async getInvitationByToken(token: string): Promise<Invitation | null> {
    const invitation = this.invitations.find(inv => inv.token === token);
    
    if (!invitation) {
      return null;
    }

    // Check if invitation is expired
    if (invitation.expiresAt < new Date() && invitation.status === 'pending') {
      invitation.status = 'expired';
      invitation.updatedAt = new Date();
    }

    return invitation;
  }

  async acceptInvitation(token: string, userId: string): Promise<void> {
    const invitation = await this.getInvitationByToken(token);
    
    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Invitation is no longer valid');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      invitation.updatedAt = new Date();
      throw new Error('Invitation has expired');
    }

    // Add user as member to the account
    await accountService.inviteMember(invitation.accountId, invitation.email, invitation.role, invitation.invitedBy);

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = userId;
    invitation.updatedAt = new Date();
  }

  async cancelInvitation(invitationId: string, cancelledBy: string): Promise<void> {
    const invitation = this.invitations.find(inv => inv.id === invitationId);
    
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Check if user has permission to cancel
    const membership = await this.getAccountMembership(invitation.accountId, cancelledBy);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      throw new Error('Insufficient permissions to cancel invitation');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Can only cancel pending invitations');
    }

    invitation.status = 'cancelled';
    invitation.updatedAt = new Date();
  }

  async resendInvitation(invitationId: string, resentBy: string): Promise<Invitation> {
    const invitation = this.invitations.find(inv => inv.id === invitationId);
    
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    // Check if user has permission to resend
    const membership = await this.getAccountMembership(invitation.accountId, resentBy);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      throw new Error('Insufficient permissions to resend invitation');
    }

    if (invitation.status !== 'pending') {
      throw new Error('Can only resend pending invitations');
    }

    // Generate new token and extend expiration
    invitation.token = this.generateInvitationToken();
    invitation.expiresAt = new Date();
    invitation.expiresAt.setDate(invitation.expiresAt.getDate() + 7);
    invitation.updatedAt = new Date();

    // Get account name for email
    const account = await accountService.getAccountById(invitation.accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Resend invitation email
    await this.sendInvitationEmail(invitation, account.name, invitation.invitedBy);

    return invitation;
  }

  private generateInvitationToken(): string {
    // Generate a secure random token
    return require('crypto').randomBytes(32).toString('hex');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidRole(role: string): role is AccountRole {
    const validRoles: AccountRole[] = ['owner', 'admin', 'editor', 'viewer', 'legal_advisor', 'financial_advisor'];
    return validRoles.includes(role as AccountRole);
  }

  private async getAccountMembership(accountId: string, userIdOrEmail: string): Promise<any> {
    // This is a simplified version - in real implementation, this would check the database
    // For now, we'll use the account service's member checking logic
    try {
      const members = await accountService.getAccountMembers(accountId, userIdOrEmail);
      return members.find(member => member.userId === userIdOrEmail);
    } catch {
      return null;
    }
  }

  private async sendInvitationEmail(invitation: Invitation, accountName: string, inviterId: string): Promise<void> {
    // Mock email sending for now
    // In real implementation, this would use a proper email service
    console.log(`📧 Invitation email sent to ${invitation.email} for account ${accountName}`);
    console.log(`🔗 Invitation link: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/invite/${invitation.token}`);
    console.log(`📅 Expires: ${invitation.expiresAt.toISOString()}`);
    console.log(`👤 Role: ${invitation.role}`);
    
    // Future implementation would include:
    // - Email service integration (SendGrid, AWS SES, etc.)
    // - HTML email templates
    // - Email tracking and analytics
    // - Rate limiting for email sending
  }
}

export const invitationService = new InvitationService(); 