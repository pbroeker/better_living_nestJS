import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { UserTag } from 'src/feature/user-tag/entity/userTags.entity';
import { createIdFindOptions } from '../utils/features/helpers';

@Injectable()
export class SharedTagService {
  constructor(
    @InjectRepository(UserTag)
    private userTagRepository: Repository<UserTag>,
  ) {}

  async findByIds(currentUser: CoreUser, ids: number[]): Promise<UserTag[]> {
    if (!ids.length) {
      return [];
    }
    const findIdOptions = createIdFindOptions(ids).map((idObject) => {
      return { ...idObject, user: currentUser };
    });

    return await this.userTagRepository.find({
      where: findIdOptions,
    });
  }

  async createTags(
    currentUser: CoreUser,
    newUsertagTitles: string[],
  ): Promise<UserTag[]> {
    try {
      const userTagEntities = newUsertagTitles.map((newUsertagTitle) => {
        const userTagEntity = this.userTagRepository.create({
          user: currentUser,
          title: newUsertagTitle,
        });
        return userTagEntity;
      });

      return userTagEntities;
    } catch (error) {
      throw new HttpException(
        {
          title: 'user-tag.error.create_tag.title',
          text: 'user-tag.error.create_tag.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
