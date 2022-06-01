import { CoreUser } from '../../core/users/entity/user.entity';

interface HasUser {
  user: CoreUser;
}

interface HasDates {
  updatedAt: Date;
  createdAt: Date;
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

export const removeDateStrings = <T extends HasDates>(
  entityWithDates: T,
): Omit<T, 'createdAt' | 'updatedAt'> => {
  const { createdAt, updatedAt, ...entityWithoutDates } = entityWithDates;
  return entityWithoutDates;
};
