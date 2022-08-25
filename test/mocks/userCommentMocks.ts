import {
  UserCommentResDto,
  UserCommentReqDto,
} from 'src/feature/user-comments/dto/user-comment.dto';

export const mockUserCommentReqDto1: UserCommentReqDto = {
  content: 'testComment1',
  roomId: 1,
  imageId: 1,
};

export const mockUserCommentResDto1: UserCommentResDto = {
  content: 'testComment1',
  roomId: 2,
  imageId: 2,
  updatedAt: new Date(),
  createdAt: new Date(),
  ownerInitials: 'P.B.',
  ownerName: 'Philipp Broeker',
};
