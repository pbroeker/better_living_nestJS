import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { PersonalRoomController } from './personal-room.controller';
import { PersonalRoomService } from './personal-room.service';
import { mockCoreUserDto } from '../../../test/mocks/coreMocks';
import {
  mockPersonalRoomResDto1,
  mockPaginatedImagesResDto,
  mockPersonalRoomReqDto,
} from '../../../test/mocks/personalRoomMocks';
import { mockImageFilter1 } from 'test/mocks/userImageMocks';

const moduleMocker = new ModuleMocker(global);
describe('personal-room-controller', () => {
  let personalRoomController: PersonalRoomController;
  let personalRoomService: PersonalRoomService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PersonalRoomController],
    })
      .useMocker((token) => {
        if (token === PersonalRoomService) {
          return {
            getAllRooms: jest.fn().mockResolvedValue([mockPersonalRoomResDto1]),
            getRoomImages: jest
              .fn()
              .mockResolvedValue(mockPaginatedImagesResDto),
            createPersonalRooms: jest
              .fn()
              .mockResolvedValue([mockPersonalRoomResDto1]),
            editPersonalRoom: jest
              .fn()
              .mockResolvedValue([mockPersonalRoomResDto1]),
            deleteRoom: jest.fn().mockResolvedValue(true),
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
    personalRoomController = moduleRef.get<PersonalRoomController>(
      PersonalRoomController,
    );
    personalRoomService =
      moduleRef.get<PersonalRoomService>(PersonalRoomService);
  });

  describe('getAllRooms', () => {
    it('calls getAllRooms with correct arguments', async () => {
      expect(
        await personalRoomController.getAllRooms(mockCoreUserDto, 10),
      ).toStrictEqual([mockPersonalRoomResDto1]);
      expect(personalRoomService.getAllRooms).toHaveBeenCalledTimes(1);
      expect(personalRoomService.getAllRooms).toHaveBeenCalledWith(
        mockCoreUserDto,
        10,
      );
    });
  });

  describe('getRoomImages', () => {
    it('calls getRoomImages with correct arguments', async () => {
      expect(
        await personalRoomController.getRoomImages(
          mockCoreUserDto,
          1,
          1,
          mockImageFilter1,
        ),
      ).toStrictEqual(mockPaginatedImagesResDto);
      expect(personalRoomService.getRoomImages).toHaveBeenCalledTimes(1);
      expect(personalRoomService.getRoomImages).toHaveBeenCalledWith(
        mockCoreUserDto,
        1,
        1,
        mockImageFilter1,
      );
    });
  });

  describe('createPersonalRooms', () => {
    it('calls createPersonalRooms with correct arguments', async () => {
      expect(
        await personalRoomController.createPersonalRooms(
          [mockPersonalRoomReqDto],
          mockCoreUserDto,
        ),
      ).toStrictEqual([mockPersonalRoomResDto1]);
      expect(personalRoomService.createPersonalRooms).toHaveBeenCalledTimes(1);
      expect(personalRoomService.createPersonalRooms).toHaveBeenCalledWith(
        [mockPersonalRoomReqDto],
        mockCoreUserDto,
      );
    });
  });

  describe('editPersonalRoom', () => {
    it('calls editPersonalRoom with correct arguments', async () => {
      expect(
        await personalRoomController.editPersonalRoom(
          1,
          mockPersonalRoomReqDto,
        ),
      ).toStrictEqual([mockPersonalRoomResDto1]);
      expect(personalRoomService.editPersonalRoom).toHaveBeenCalledTimes(1);
      expect(personalRoomService.editPersonalRoom).toHaveBeenCalledWith(
        1,
        mockPersonalRoomReqDto,
      );
    });
  });

  describe('deleteRoom', () => {
    it('calls deleteRoom with correct arguments', async () => {
      expect(await personalRoomController.deleteRoom(mockCoreUserDto, 1)).toBe(
        true,
      );
      expect(personalRoomService.deleteRoom).toHaveBeenCalledTimes(1);
      expect(personalRoomService.deleteRoom).toHaveBeenCalledWith(
        mockCoreUserDto,
        1,
      );
    });
  });
});
