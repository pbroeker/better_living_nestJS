import { Test, TestingModule } from '@nestjs/testing';
import { UserCommentService } from './user-comment.service';

describe('UserCommentService', () => {
  let service: UserCommentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserCommentService],
    }).compile();

    service = module.get<UserCommentService>(UserCommentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
