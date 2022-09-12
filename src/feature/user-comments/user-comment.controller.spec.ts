import { Test, TestingModule } from '@nestjs/testing';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { UserCommentController } from './user-comment.controller';
import { UserCommentService } from './user-comment.service';
import {
  mockUserCommentReqDto1,
  mockUserCommentResDto1,
} from '../../../test/mocks/userCommentMocks';
import { mockCoreUserDto } from '../../../test/mocks/coreMocks';

const moduleMocker = new ModuleMocker(global);

describe('user-tags', () => {
  let userCommentController: UserCommentController;
  let userCommentService: UserCommentService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UserCommentController],
    })
      .useMocker((token) => {
        if (token === UserCommentService) {
          return {
            getAllUserComments: jest
              .fn()
              .mockResolvedValue([mockUserCommentResDto1]),
            createUserComment: jest
              .fn()
              .mockResolvedValue(mockUserCommentResDto1),
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
    userCommentController = moduleRef.get<UserCommentController>(
      UserCommentController,
    );
    userCommentService = moduleRef.get<UserCommentService>(UserCommentService);
  });

  describe('getAllComments', () => {
    it('calls getAllComments with correct arguments', async () => {
      expect(
        await userCommentController.getAllUserComments(mockCoreUserDto),
      ).toStrictEqual([mockUserCommentResDto1]);
      expect(userCommentService.getAllUserComments).toHaveBeenCalledTimes(1);
      expect(userCommentService.getAllUserComments).toHaveBeenCalledWith(
        mockCoreUserDto,
      );
    });
  });

  describe('createUserComment', () => {
    it('calls createUserComment with correct arguments', async () => {
      expect(
        await userCommentController.createUserComment(
          mockCoreUserDto,
          mockUserCommentReqDto1,
        ),
      ).toStrictEqual(mockUserCommentResDto1);
      expect(userCommentService.createUserComment).toHaveBeenCalledTimes(1);
      expect(userCommentService.createUserComment).toHaveBeenCalledWith(
        mockCoreUserDto,
        mockUserCommentReqDto1,
      );
    });
  });
});
