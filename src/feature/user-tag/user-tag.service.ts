import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedImageService } from '../../shared/shared-image.service';
import { Repository } from 'typeorm';
import { UserTagReqDto, UserTagResDto } from './dto/user-tag.dto';
import { UserTag } from './entity/userTags.entity';
import { UserImage } from '../user-image/entity/user-image.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class UserTagService {
  constructor(
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
    @InjectRepository(UserTag)
    private userTagRepository: Repository<UserTag>,
  ) {}

  async getAllTags(user: CoreUserDto): Promise<UserTagResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const userTagEntities = await this.userTagRepository.find({
        relations: ['userImages'],
        where: { user: activeCoreUser },
      });

      const userTagDtos = userTagEntities.map((entity) => {
        return plainToInstance(UserTagResDto, instanceToPlain(entity), {
          excludeExtraneousValues: true,
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
      if (userTagDto.userImageIds) {
        userImageEntities = await this.sharedImageService.findOwnedByIds(
          activeCoreUser,
          userTagDto.userImageIds,
        );
      } else {
        userImageEntities = [];
      }

      const userTagEntity = this.userTagRepository.create({
        user: activeCoreUser,
        title: userTagDto.title,
        userImages: userImageEntities,
      });

      const savedTagEntity = await this.userTagRepository.save(userTagEntity);

      return plainToInstance(UserTagResDto, instanceToPlain(savedTagEntity), {
        excludeExtraneousValues: true,
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
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );
      const deleteResult = await this.userTagRepository.delete({
        user: { id: activeCoreUser.id },
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
}
