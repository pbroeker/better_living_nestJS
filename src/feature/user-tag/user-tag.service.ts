import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from '../../core/user/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedImageService } from '../../shared/shared-image.service';
import { Repository } from 'typeorm';
import {
  RoomImageCombination,
  UserTagReqDto,
  UserTagResDto,
} from './dto/user-tag.dto';
import { UserTag } from './entity/userTags.entity';
import { UserImage } from '../user-image/entity/user-image.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PersonalRoom } from '../personal-room/entity/personalRoom.entity';
import { SharedRoomService } from 'src/shared/shared-room.service';
import * as _ from 'lodash';
@Injectable()
export class UserTagService {
  constructor(
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
    private sharedRoomService: SharedRoomService,
    @InjectRepository(UserTag)
    private userTagRepository: Repository<UserTag>,
  ) {}

  async getAllTags(user: CoreUserDto): Promise<UserTagResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const userTagEntities = await this.userTagRepository.find({
        relations: { userImages: true, personalRooms: true },
        where: { user: activeCoreUser },
        order: {
          id: 'ASC',
        },
      });

      const userTagDtos = userTagEntities.map((entity) => {
        return plainToInstance(UserTagResDto, instanceToPlain(entity), {
          excludeExtraneousValues: true,
          groups: ['getCompleteTag'],
        });
      });

      return userTagDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'user-tag.error.get_all_tags.title',
          text: 'user-tag.error.get_all_tags.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createTag(
    user: CoreUserDto,
    userTagDto: UserTagReqDto,
  ): Promise<UserTagResDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      let userImageEntities: UserImage[] = [];
      let personalRoomEntities: PersonalRoom[] = [];
      let roomImageCombinations: RoomImageCombination[] = [];
      if (userTagDto.roomImageCombinations) {
        const roomIds = userTagDto.roomImageCombinations.map(
          (combination) => combination.roomId,
        );
        personalRoomEntities = await this.sharedRoomService.findAnyByIds(
          roomIds,
        );
        const imageIds = userTagDto.roomImageCombinations.map(
          (combination) => combination.imageId,
        );
        userImageEntities = await this.sharedImageService.findAnyByIds(
          imageIds,
        );
        roomImageCombinations = userTagDto.roomImageCombinations;
      }

      const userTagEntity = this.userTagRepository.create({
        user: activeCoreUser,
        title: userTagDto.title,
        userImages: userImageEntities,
        personalRooms: personalRoomEntities,
        roomImageCombinations: JSON.stringify(roomImageCombinations),
      });

      const savedTagEntity = await this.userTagRepository.save(userTagEntity);

      return plainToInstance(UserTagResDto, instanceToPlain(savedTagEntity), {
        excludeExtraneousValues: true,
        groups: ['getCompleteTag'],
      });
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

  async deleteTag(user: CoreUserDto, tagId: number): Promise<boolean> {
    try {
      const deleteResult = await this.userTagRepository.delete({
        user: { id: user.userId },
        id: tagId,
      });
      return deleteResult.affected > 0;
    } catch (error) {
      throw new HttpException(
        {
          title: 'user_tag.error.delete_user_tag.title',
          text: 'user_tag.error.delete_user_tag.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async removeTag(
    user: CoreUserDto,
    tagId: number,
    removeCombination: RoomImageCombination,
  ): Promise<boolean> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const roomEntity = (
        await this.sharedRoomService.findOwnedByIds(activeCoreUser, [
          removeCombination.roomId,
        ])
      )[0];

      if (roomEntity) {
        const tagEntity = await this.userTagRepository.findOne({
          where: { id: tagId },
          relations: { personalRooms: true, userImages: true },
        });

        const oldCombinations = JSON.parse(
          tagEntity.roomImageCombinations,
        ) as RoomImageCombination[];

        const newCombinations = oldCombinations.filter((combination) => {
          return (
            combination.imageId != removeCombination.imageId ||
            combination.roomId != removeCombination.roomId
          );
        });

        const newRoomIds = _.uniq(
          newCombinations.map((combination) => combination.roomId),
        );
        const newImageIds = _.uniq(
          newCombinations.map((combination) => combination.imageId),
        );

        const newPersonalRooms = await this.sharedRoomService.findAnyByIds(
          newRoomIds,
        );
        const newUserImages = await this.sharedImageService.findAnyByIds(
          newImageIds,
        );

        tagEntity.personalRooms = newPersonalRooms;
        tagEntity.userImages = newUserImages;
        tagEntity.roomImageCombinations = JSON.stringify(newCombinations);

        await this.userTagRepository.save(tagEntity);
        return true;
      } else {
        throw new HttpException(
          {
            title: 'user_tag.error.not_room_owner.title',
            text: 'user_tag.error.not_room_owner.message',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          title: error.response?.title
            ? error.response.title
            : 'user_tag.error.remove_user_tag.title',
          text: error.response?.text
            ? error.response.text
            : 'user_tag.error.remove_user_tag.message',
        },
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
