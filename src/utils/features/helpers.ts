import { RoomImageCombination } from 'src/feature/user-tag/dto/user-tag.dto';
import { CoreUser } from '../../core/users/entity/user.entity';

interface HasUser {
  user: CoreUser;
}

export const createIdFindOptions = (ids: number[]): { id: number }[] => {
  return ids.map((id) => {
    return { id: id };
  });
};

export const removeUser = <T extends HasUser>(
  entityWithUser: T,
): Omit<T, 'user'> => {
  const { user, ...entityWithoutUser } = entityWithUser;
  return entityWithoutUser;
};

export const getUserInitials = (user: CoreUser): string => {
  if (user.first_name && user.last_name) {
    return `${user.first_name.charAt(0).toUpperCase()}${user.last_name
      .charAt(0)
      .toUpperCase()}`;
  } else if (user.first_name) {
    return `${user.first_name.charAt(0).toUpperCase()}${user.first_name
      .charAt(1)
      .toUpperCase()}`;
  } else {
    return `${user.user_email.charAt(0).toUpperCase()}${user.user_email
      .charAt(1)
      .toUpperCase()}`;
  }
};

export const createRoomImageCombinations = (
  roomIds: number[],
  imageIds: number[],
) => {
  return roomIds.flatMap((roomId) =>
    imageIds.map((imageId) => {
      const combination: RoomImageCombination = {
        roomId: roomId,
        imageId: imageId,
      };
      return combination;
    }),
  );
};
