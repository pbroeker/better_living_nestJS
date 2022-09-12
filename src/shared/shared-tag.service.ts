import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { RoomImageCombination } from 'src/feature/user-tag/dto/user-tag.dto';
import { FindOptionsRelations, Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { UserTag } from '../feature/user-tag/entity/userTags.entity';
import { createIdFindOptions } from '../utils/features/helpers';
import * as _ from 'lodash';

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

  async findAllOwned(currentUser: CoreUser): Promise<UserTag[]> {
    return await this.userTagRepository.find({
      where: { user: currentUser },
      relations: {
        user: true,
      },
    });
  }

  async findOwnedByIds(
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

  async findAnyByIds(
    ids: number[],
    relations: FindOptionsRelations<UserTag> = {},
  ): Promise<UserTag[]> {
    if (!ids.length) {
      return [];
    }
    const findIdOptions = createIdFindOptions(ids).map((idObject) => {
      return { ...idObject };
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
    roomImageCombinations: RoomImageCombination[],
  ): Promise<UserTag[]> {
    try {
      const userTagEntities = newUsertagTitles.map((newUsertagTitle) => {
        const userTagEntity = this.userTagRepository.create({
          user: currentUser,
          title: newUsertagTitle,
          personalRooms: roomEntities,
          roomImageCombinations: JSON.stringify(roomImageCombinations),
        });
        return userTagEntity;
      });

      const savedUserTagEntities = await this.userTagRepository.save(
        userTagEntities,
      );

      return savedUserTagEntities;
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

  async removeCombinations(
    userTags: UserTag[],
    newUserTagIds: number[],
    combinationsToEdit: RoomImageCombination[],
    newRoomEntities: PersonalRoom[],
  ): Promise<UserTag[]> {
    const oldTagIds = userTags.map((userTag) => userTag.id);
    const tagIdsToRemove = _.difference(oldTagIds, newUserTagIds);

    // editting tags that are going to be removed
    const tagsToRemove = userTags
      .filter((userTag) => tagIdsToRemove.includes(userTag.id))
      .map((userTag) => {
        const oldCombinations = JSON.parse(
          userTag.roomImageCombinations,
        ) as RoomImageCombination[];

        const newCombinations = _.differenceWith(
          oldCombinations,
          combinationsToEdit,
          _.isEqual,
        );

        const newRoomCombinations = newCombinations.map(
          (combination: RoomImageCombination) => combination.roomId,
        );

        const newPersonalRooms = userTag.personalRooms.filter((personalRoom) =>
          newRoomCombinations.includes(personalRoom.id),
        );

        userTag.personalRooms = newPersonalRooms;
        userTag.roomImageCombinations = JSON.stringify(newCombinations);
        return userTag;
      });
    await this.userTagRepository.save(tagsToRemove);

    // edit used tags
    const existingTagEntitites = await this.findAnyByIds(newUserTagIds, {
      personalRooms: true,
    });

    existingTagEntitites.map((userTag) => {
      const oldCombinations = JSON.parse(
        userTag.roomImageCombinations,
      ) as RoomImageCombination[];

      const newCombinations = _.uniqWith(
        [...oldCombinations, ...combinationsToEdit],
        _.isEqual,
      );

      userTag.personalRooms = [...userTag.personalRooms, ...newRoomEntities];
      userTag.roomImageCombinations = JSON.stringify(newCombinations);
    });

    const savedNewTags = await this.userTagRepository.save(
      existingTagEntitites,
    );

    return savedNewTags;
  }
}
