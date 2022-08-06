import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { PersonalRoomResDto } from './dto/personal-room.dto';
import { PersonalRoomController } from './personal-room.controller';
import { PersonalRoomService } from './personal-room.service';

const mockCoreUserDto: CoreUserDto = {
  email: 'fakemail@dropmail.cc',
  userId: 1,
  first_name: 'first_fake_name',
};

const mockRoom1Dto: PersonalRoomResDto = {
  title: 'mockRoom1',
  iconId: 1,
  id: 1,
};

const mockRoom2Dto: PersonalRoomResDto = {
  title: 'mockRoom2',
  iconId: 2,
  id: 2,
};

const moduleMocker = new ModuleMocker(global);
describe('PersonalRoomController', () => {
  let personalRoomController: PersonalRoomController;
  let personalRoomService: PersonalRoomService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [PersonalRoomController],
    })
      .useMocker((token) => {
        if (token === PersonalRoomService) {
          return {
            getAllRooms: jest.fn(),
            getRoomImages: jest.fn(),
            createPersonalRooms: jest.fn(),
            editPersonalRoom: jest.fn(),
            deleteRoom: jest.fn(),
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
    it('calls getAllRooms correctly', async () => {
      await personalRoomController.getAllRooms(mockCoreUserDto);

      expect(personalRoomService.getAllRooms).toHaveBeenCalledTimes(1);
      expect(personalRoomService.getAllRooms).toHaveBeenCalledWith(
        mockCoreUserDto,
      );
      //   expect(personalRoomService.getAllRooms).toHaveReturnedWith([
      //     mockRoom1Dto,
      //     mockRoom2Dto,
      //   ]);
    });
  });

  //   describe('getRoomImages', () => {
  //     it('calls getRoomImages correctly', async () => {
  //       await personalRoomController.getRoomImages(mockCoreUserDto, 1, 1);

  //       expect(personalRoomService.getRoomImages).toHaveBeenCalledTimes(1);
  //       expect(personalRoomService.getRoomImages).toHaveBeenCalledWith(
  //         mockCoreUserDto,
  //         1,
  //         1,
  //       );
  //     });
  //   });
});
