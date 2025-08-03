export interface CreateInvitationRequest {
  email: string;
  role: AccountRole;
  message?: string;
}

export interface Invitation {
  id: string;
  accountId: string;
  email: string;
  role: AccountRole;
  invitedBy: string;
  token: string;
  status: InvitationStatus;
  message?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt?: Date;
  acceptedBy?: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface InvitationResponse {
  success: boolean;
  invitation?: Invitation;
  message?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  userId: string;
}

export interface GetInvitationsResponse {
  success: boolean;
  invitations: Invitation[];
}

export interface CancelInvitationRequest {
  invitationId: string;
}

// Email template interface for future email service integration
export interface InvitationEmailData {
  to: string;
  from: string;
  subject: string;
  template: string;
  data: {
    accountName: string;
    inviterName: string;
    role: string;
    invitationLink: string;
    expiresAt: string;
    message?: string;
  };
} 