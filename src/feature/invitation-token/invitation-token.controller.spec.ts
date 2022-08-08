import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { InvitationTokenController } from './invitation-token.controller';
import { InvitationTokenService } from './invitation-token.service';
import { mockCoreUserDto } from '../../../test/mocks/mocks';
import { mockGuestUserResDto } from '../../../test/mocks/guestUserMocks';
import {
  mockInvitationTokenReqDto,
  mockInvitationTokenResDto,
  mockPendingInvitationResDto,
} from '../../../test/mocks/invitationTokenMocks';
const moduleMocker = new ModuleMocker(global);

describe('invitation-token', () => {
  let invitationTokenController: InvitationTokenController;
  let invitationTokenService: InvitationTokenService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [InvitationTokenController],
    })
      .useMocker((token) => {
        if (token === InvitationTokenService) {
          return {
            getPendingInvitations: jest
              .fn()
              .mockResolvedValue([mockPendingInvitationResDto]),
            createInvitationToken: jest
              .fn()
              .mockResolvedValue(mockInvitationTokenResDto),
            checkInvitationToken: jest
              .fn()
              .mockResolvedValue(mockGuestUserResDto),
            deleteInvitationToken: jest.fn().mockResolvedValue(true),
          };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    invitationTokenController = moduleRef.get<InvitationTokenController>(
      InvitationTokenController,
    );
    invitationTokenService = moduleRef.get<InvitationTokenService>(
      InvitationTokenService,
    );
  });

  describe('getPendingInvitations', () => {
    it('calls getPendingInvitations with correct arguments', async () => {
      expect(
        await invitationTokenController.getPendingInvitations(mockCoreUserDto),
      ).toStrictEqual([mockPendingInvitationResDto]);
      expect(
        invitationTokenService.getPendingInvitations,
      ).toHaveBeenCalledTimes(1);
      expect(invitationTokenService.getPendingInvitations).toHaveBeenCalledWith(
        mockCoreUserDto,
      );
    });
  });

  describe('createInvitationToken', () => {
    it('calls createInvitationToken with correct arguments', async () => {
      expect(
        await invitationTokenController.createInvitationToken(mockCoreUserDto),
      ).toStrictEqual(mockInvitationTokenResDto);
      expect(
        invitationTokenService.createInvitationToken,
      ).toHaveBeenCalledTimes(1);
      expect(invitationTokenService.createInvitationToken).toHaveBeenCalledWith(
        mockCoreUserDto,
      );
    });
  });

  describe('checkInvitationToken', () => {
    it('calls checkInvitationToken with correct arguments', async () => {
      expect(
        await invitationTokenController.checkInvitationToken(
          mockCoreUserDto,
          mockInvitationTokenReqDto,
        ),
      ).toStrictEqual(mockGuestUserResDto);
      expect(invitationTokenService.checkInvitationToken).toHaveBeenCalledTimes(
        1,
      );
      expect(invitationTokenService.checkInvitationToken).toHaveBeenCalledWith(
        mockCoreUserDto,
        mockInvitationTokenReqDto.invitationToken,
      );
    });
  });

  describe('deleteInvitationToken', () => {
    it('calls deleteInvitationToken with correct arguments', async () => {
      expect(
        await invitationTokenController.deleteInvitationToken(
          mockCoreUserDto,
          1,
        ),
      ).toBe(true);
      expect(
        invitationTokenService.deleteInvitationToken,
      ).toHaveBeenCalledTimes(1);
      expect(invitationTokenService.deleteInvitationToken).toHaveBeenCalledWith(
        mockCoreUserDto,
        1,
      );
    });
  });
});
