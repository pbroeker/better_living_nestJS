import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { UserTag } from '../feature/user-tag/entity/userTags.entity';
import { createIdFindOptions } from '../utils/features/helpers';

@Injectable()
export class SharedTagService {
  constructor(
    @InjectRepository(UserTag)
    private userTagRepository: Repository<UserTag>,
  ) {}

  async findAll(): Promise<UserTag[]> {
    return await this.userTagRepository.find({
      relations: {
        personalRooms: true,
        userImages: { personalRooms: true },
        user: true,
      },
    });
  }

  async findByIds(
    currentUser: CoreUser,
    ids: number[],
    relations: FindOptionsRelations<UserTag> = {},
  ): Promise<UserTag[]> {
    if (!ids.length) {
      return [];
    }
    const findIdOptions = createIdFindOptions(ids).map((idObject) => {
      return { ...idObject, user: currentUser };
    });

    return await this.userTagRepository.find({
      where: findIdOptions,
      relations: relations,
    });
  }

  async createTags(
    currentUser: CoreUser,
    newUsertagTitles: string[],
    roomEntities: PersonalRoom[],
  ): Promise<UserTag[]> {
    try {
      const userTagEntities = newUsertagTitles.map((newUsertagTitle) => {
        const userTagEntity = this.userTagRepository.create({
          user: currentUser,
          title: newUsertagTitle,
          personalRooms: roomEntities,
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

  async editTags(tagEntities: UserTag[]): Promise<UserTag[]> {
    try {
      return await this.userTagRepository.save(tagEntities);
    } catch (error) {
      throw new HttpException(
        {
          title: 'user-tag.error.edit-tag.title',
          text: 'user-tag.error.edit-tag.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
