import { CoreUser } from '../../../core/users/entity/user.entity';
import { UserCommentResDto } from '../../../feature/user-comments/dto/user-comment.dto';
import { UserComment } from '../../../feature/user-comments/entity/userComment.entity';
import { getUserInitials } from '../../../utils/features/helpers';

export const commentsToCommentsDtos = (
  user: CoreUser,
  comments: UserComment[],
): UserCommentResDto[] => {
  return comments.map((comment) => {
    return {
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      imageId: comment.userImage.id,
      roomId: comment.personalRoom.id,
      ownerName: `${user.first_name} ${user.last_name}`,
      ownerInitials: getUserInitials(user),
    };
  });
};
