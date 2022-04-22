import { CoreUser } from 'src/core/users/entity/user.entity';

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
