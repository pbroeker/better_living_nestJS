import { Test, TestingModule } from '@nestjs/testing';
import { UserCommentController } from './user-comment.controller';

describe('UserCommentController', () => {
  let controller: UserCommentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCommentController],
    }).compile();

    controller = module.get<UserCommentController>(UserCommentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
