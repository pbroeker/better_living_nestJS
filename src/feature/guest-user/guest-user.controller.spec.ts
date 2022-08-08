import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { GuestUserController } from './guest-user.controller';
import { GuestUserService } from './guest-user.service';
import { mockCoreUserDto } from '../../../test/mocks/coreMocks';
import { mockGuestUserResDto } from '../../../test/mocks/guestUserMocks';

const moduleMocker = new ModuleMocker(global);

describe('guest-user', () => {
  let guestUserController: GuestUserController;
  let guestUserService: GuestUserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [GuestUserController],
    })
      .useMocker((token) => {
        if (token === GuestUserService) {
          return {
            getAllGuests: jest.fn().mockResolvedValue([mockGuestUserResDto]),
            getAllHosts: jest.fn().mockResolvedValue([mockGuestUserResDto]),
            deleteUser: jest.fn().mockResolvedValue(true),
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
    guestUserController =
      moduleRef.get<GuestUserController>(GuestUserController);
    guestUserService = moduleRef.get<GuestUserService>(GuestUserService);
  });

  describe('getGuests', () => {
    it('calls getGuests with correct arguments', async () => {
      expect(
        await guestUserController.getGuests(mockCoreUserDto),
      ).toStrictEqual([mockGuestUserResDto]);
      expect(guestUserService.getAllGuests).toHaveBeenCalledTimes(1);
      expect(guestUserService.getAllGuests).toHaveBeenCalledWith(
        mockCoreUserDto,
      );
    });
  });
  describe('getHosts', () => {
    it('calls getHosts with correct arguments', async () => {
      expect(await guestUserController.getHosts(mockCoreUserDto)).toStrictEqual(
        [mockGuestUserResDto],
      );
      expect(guestUserService.getAllHosts).toHaveBeenCalledTimes(1);
      expect(guestUserService.getAllHosts).toHaveBeenCalledWith(
        mockCoreUserDto,
      );
    });
  });

  describe('deleteHost', () => {
    it('calls deleteHost correctly', async () => {
      expect(await guestUserController.deleteHost(mockCoreUserDto, 1)).toBe(
        true,
      );
      expect(guestUserService.deleteUser).toHaveBeenCalledTimes(1);
      expect(guestUserService.deleteUser).toHaveBeenCalledWith(
        1,
        mockCoreUserDto.userId,
      );
    });
  });

  describe('deleteGuest', () => {
    it('calls deleteGuest correctly', async () => {
      expect(await guestUserController.deleteGuest(mockCoreUserDto, 1)).toBe(
        true,
      );
      expect(guestUserService.deleteUser).toHaveBeenCalledTimes(1);
      expect(guestUserService.deleteUser).toHaveBeenCalledWith(
        mockCoreUserDto.userId,
        1,
      );
    });
  });
});
