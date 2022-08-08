import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { UserTagService } from './user-tag.service';
import { UserTagsController } from './user-tag.controller';
import {
  mockUserTagReqDto1,
  mockUserTagResDto1,
} from '../../../test/mocks/userTagMocks';
import { mockCoreUserDto } from '../../../test/mocks/coreMocks';

const moduleMocker = new ModuleMocker(global);

describe('user-tags', () => {
  let userTagsController: UserTagsController;
  let userTagService: UserTagService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserTagsController],
    })
      .useMocker((token) => {
        if (token === UserTagService) {
          return {
            getAllTags: jest.fn().mockResolvedValue([mockUserTagResDto1]),
            createTag: jest.fn().mockResolvedValue(mockUserTagResDto1),
            deleteTag: jest.fn().mockResolvedValue(true),
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
    userTagsController = moduleRef.get<UserTagsController>(UserTagsController);
    userTagService = moduleRef.get<UserTagService>(UserTagService);
  });

  describe('getAllTags', () => {
    it('calls getAllTags with correct arguments', async () => {
      expect(
        await userTagsController.getAllTags(mockCoreUserDto),
      ).toStrictEqual([mockUserTagResDto1]);
      expect(userTagService.getAllTags).toHaveBeenCalledTimes(1);
      expect(userTagService.getAllTags).toHaveBeenCalledWith(mockCoreUserDto);
    });
  });

  describe('createUserTag', () => {
    it('calls createUserTag with correct arguments', async () => {
      expect(
        await userTagsController.createUserTag(
          mockCoreUserDto,
          mockUserTagReqDto1,
        ),
      ).toStrictEqual(mockUserTagResDto1);
      expect(userTagService.createTag).toHaveBeenCalledTimes(1);
      expect(userTagService.createTag).toHaveBeenCalledWith(
        mockCoreUserDto,
        mockUserTagReqDto1,
      );
    });
  });

  describe('deleteTag', () => {
    it('calls deleteTag with correct arguments', async () => {
      expect(
        await userTagsController.deleteTag(mockCoreUserDto, 1),
      ).toStrictEqual(true);
      expect(userTagService.deleteTag).toHaveBeenCalledTimes(1);
      expect(userTagService.deleteTag).toHaveBeenCalledWith(mockCoreUserDto, 1);
    });
  });
});
