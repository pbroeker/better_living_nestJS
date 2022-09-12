import {
  InvitationTokenReqDto,
  InvitationTokenResDto,
  PendingInvitationResDto,
} from 'src/feature/invitation-token/dto/invitation-token.dto';

export const mockInvitationTokenReqDto: InvitationTokenReqDto = {
  invitationToken: 'mockinvitationToken',
};
export const mockInvitationTokenResDto: InvitationTokenResDto = {
  invitationToken: 'mockinvitationToken',
  inviter: 'mockInviter',
};

export const mockPendingInvitationResDto: PendingInvitationResDto = {
  id: 1,
  createdAt: new Date(),
};
