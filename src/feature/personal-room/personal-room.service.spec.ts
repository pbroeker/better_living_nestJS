import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedAreaService } from '../../shared/shared-area.service';
import { SharedImageService } from '../../shared/shared-image.service';
import { SharedUserService } from '../../shared/shared-user.service';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { PersonalRoomService } from './personal-room.service';
import { CoreUser } from 'src/core/users/entity/user.entity';
import { PersonalArea } from '../personal-areas/entity/personalArea.entity';
import {
  PersonalRoomReqDto,
  PersonalRoomResDto,
} from './dto/personal-room.dto';
import { UserImage } from '../user-image/entity/user-image.entity';
import { UserTag } from '../user-tag/entity/userTags.entity';
import { PaginatedImagesResDto } from '../user-image/dto/user-image.dto';
import { getUserInitials } from '../../utils/features/helpers';
import { HttpException } from '@nestjs/common';
import { UserComment } from '../user-comments/entity/userComment.entity';
import { UserCommentResDto } from '../user-comments/dto/user-comment.dto';

const mockCoreUserDto: CoreUserDto = {
  userId: 1,
  email: 'mockmail@mock.de',
};

const mockCoreUser: CoreUser = {
  user_email: 'fakemail@dropmail.cc',
  user_password: 'fakePassword123',
  id: 1,
  guests: [],
  hosts: [],
  personalAreas: [],
  personalRooms: [],
  userTags: [],
  images: [],
  invitationTokens: [],
  currentHashedRefreshToken: '',
  news_consent: false,
  ownedAreas: [],
  first_name: 'first_fake_name',
};

const mockRoom: PersonalRoom = {
  id: 1,
  title: 'mockRoom',
  iconId: 1,
  user: mockCoreUser,
  userImages: [],
  personalArea: {} as PersonalArea,
  userComments: [] as UserComment[],
};

const mockRoomResDto: PersonalRoomResDto = {
  title: mockRoom.title,
  iconId: mockRoom.iconId,
  id: mockRoom.id,
  totalImages: 0,
  userImages: [],
  userComments: [] as UserCommentResDto[],
};
const mockUserImage: UserImage = {
  id: 1,
  src: 'mockSource',
  key: 'mockKey',
  height: 1000,
  width: 500,
  personalRooms: [] as PersonalRoom[],
  user: mockCoreUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  userTags: [] as UserTag[],
  userComments: [],
};

const mockPaginatedImageResDto: PaginatedImagesResDto = {
  total: 1,
  currentPage: 1,
  lastPage: 1,
  nextPage: null,
  prevPage: null,
  images: [mockUserImage],
  filterOptions: {
    users: [{ first_name: mockCoreUser.first_name, id: mockCoreUser.id }],
    tags: [],
  },
};

const mockPersonalRoomReqDto: PersonalRoomReqDto = {
  title: 'newMockRoom',
  iconId: 2,
  areaId: 2,
};

const mockDefaultArea: PersonalArea = {
  id: 1,
  title: 'Unassigned',
  owner: mockCoreUser,
  users: [mockCoreUser],
  personalRooms: [] as PersonalRoom[],
};

const mockPersonalArea: PersonalArea = {
  id: 2,
  title: 'mockarea',
  owner: mockCoreUser,
  users: [mockCoreUser],
  personalRooms: [] as PersonalRoom[],
};

const mockPersonalRoom: PersonalRoom = {
  id: 1,
  title: 'newMockRoom',
  iconId: 2,
  personalArea: mockPersonalArea,
  user: mockCoreUser,
  userImages: [],
  userComments: [],
};

const PersonalRoomRepositoryFake = {
  save: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn().mockImplementation(() => [mockRoom]),
  delete: jest.fn(),
};

const moduleMocker = new ModuleMocker(global);

describe('RoomService', () => {
  let personalRoomService: PersonalRoomService;
  let personalRoomRepository: Repository<PersonalRoom>;
  let sharedAreaService: SharedAreaService;
  let sharedUserService: SharedUserService;
  let sharedImageService: SharedImageService;

  beforeEach(async () => {
    jest.resetAllMocks();
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        PersonalRoomService,
        {
          provide: getRepositoryToken(PersonalRoom),
          useValue: PersonalRoomRepositoryFake,
        },
      ],
    })
      .useMocker((token) => {
        if (token === SharedAreaService) {
          return {
            findByTitle: jest.fn().mockResolvedValue(mockDefaultArea),
            createNewArea: jest.fn().mockResolvedValue(mockDefaultArea),
            findById: jest.fn().mockResolvedValue(mockPersonalArea),
          };
        }
        if (token === SharedUserService) {
          return {
            findByEmail: jest.fn().mockResolvedValue(mockCoreUser),
            findGuestsByHost: jest.fn().mockResolvedValue([]),
          };
        }
        if (token === SharedImageService) {
          return {
            findAllRoomImages: jest.fn().mockResolvedValue([mockUserImage]),
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
    personalRoomService =
      moduleRef.get<PersonalRoomService>(PersonalRoomService);
    sharedAreaService = moduleRef.get<SharedAreaService>(SharedAreaService);
    sharedUserService = moduleRef.get<SharedUserService>(SharedUserService);
    sharedImageService = moduleRef.get<SharedImageService>(SharedImageService);
    personalRoomRepository = moduleRef.get(getRepositoryToken(PersonalRoom));
  });

  describe('getAllRooms', () => {
    it('calls findByEmail with correct parameters', async () => {
      jest.spyOn(personalRoomRepository, 'find').mockResolvedValueOnce([]);

      await personalRoomService.getAllRooms(mockCoreUserDto);

      expect(sharedUserService.findByEmail).toHaveBeenCalledTimes(1);
      expect(sharedUserService.findByEmail).toHaveBeenCalledWith(
        mockCoreUserDto.email,
      );
    });

    it('returns the correct result', async () => {
      jest
        .spyOn(personalRoomRepository, 'find')
        .mockResolvedValueOnce([mockRoom]);

      expect(
        await personalRoomService.getAllRooms(mockCoreUserDto),
      ).toStrictEqual([mockRoomResDto]);
    });

    it('throws an internal error if anything goes wrong', async () => {
      jest.spyOn(sharedUserService, 'findByEmail').mockRejectedValueOnce(false);
      expect.assertions(3);
      try {
        await personalRoomService.getAllRooms(mockCoreUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response.title).toBe(
          'personal_rooms.error.get_personal_room.title',
        );
        expect(error.status).toBe(500);
      }
    });
  });

  describe('getRoomImages', () => {
    it('calls findRoomimages correctly', async () => {
      const { user, ...imageNoUser } = mockUserImage;
      const expectedRoomImages: PaginatedImagesResDto = {
        ...mockPaginatedImageResDto,
        images: [
          {
            isOwner: true,
            ...imageNoUser,
            ownerInitials: getUserInitials(mockCoreUser),
          },
        ],
      };
      expect(
        await personalRoomService.getRoomImages(mockCoreUserDto, 1, 1),
      ).toStrictEqual(expectedRoomImages);

      expect(sharedImageService.findAllRoomImages).toHaveBeenCalledTimes(1);
      expect(sharedImageService.findAllRoomImages).toHaveBeenCalledWith(1);
    });

    it('throws an internal error if anything goes wrong', async () => {
      jest.spyOn(sharedUserService, 'findByEmail').mockRejectedValueOnce(false);
      expect.assertions(3);
      try {
        await personalRoomService.getRoomImages(mockCoreUserDto, 1, 1);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.response.title).toBe(
          'personal_rooms.error.get_room_images.title',
        );
        expect(error.status).toBe(500);
      }
    });
  });

  describe('createPersonalRooms', () => {
    it('calls create correct rooms when having a defaultarea', async () => {
      const { userImages, ...mockPersonalRoomNoImages } = mockPersonalRoom;
      jest
        .spyOn(personalRoomRepository, 'save')
        .mockResolvedValueOnce([mockPersonalRoomNoImages] as any);

      jest
        .spyOn(personalRoomRepository, 'create')
        .mockImplementation(() => mockPersonalRoom);

      await personalRoomService.createPersonalRooms(
        [mockPersonalRoomReqDto],
        mockCoreUserDto,
      ),
        expect(personalRoomRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  it('calls createNewArea when no defaultArea there', async () => {
    jest
      .spyOn(sharedAreaService, 'findByTitle')
      .mockResolvedValueOnce(undefined);

    const { userImages, ...mockPersonalRoomNoImages } = mockPersonalRoom;
    jest
      .spyOn(personalRoomRepository, 'save')
      .mockResolvedValueOnce([mockPersonalRoomNoImages] as any);

    jest
      .spyOn(personalRoomRepository, 'create')
      .mockImplementation(() => mockPersonalRoom);

    await personalRoomService.createPersonalRooms(
      [mockPersonalRoomReqDto],
      mockCoreUserDto,
    );
    expect(sharedAreaService.createNewArea).toHaveBeenCalledTimes(1);
    expect(sharedAreaService.createNewArea).toHaveBeenCalledWith(
      mockCoreUser,
      [],
    );
  });
});
