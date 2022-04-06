import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { CoreUser } from 'src/core/users/entity/user.entity';
import { QueryRunner } from 'typeorm';

export const getUserWithQueryRunner = async (
  queryRunner: QueryRunner,
  user: CoreUserDto,
  relation?: string,
): Promise<CoreUser> => {
  if (relation) {
    return await queryRunner.manager.findOne(CoreUser, user.userId, {
      relations: [relation],
    });
  } else {
    return await queryRunner.manager.findOne(CoreUser, user.userId);
  }
};
