import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { SharedRoomService } from '../../shared/shared-room.service';
import { In, Repository } from 'typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import {
  EditImageDto,
  ImageFilterQuery,
  PaginatedImagesResDto,
  UserImageDto,
} from './dto/user-image.dto';
import { UserImage } from './entity/user-image.entity';
import { RequestHandler } from '@nestjs/common/interfaces';
import { UserTag } from '../user-tag/entity/userTags.entity';
import { SharedTagService } from '../../shared/shared-tag.service';
import { SharedImageService } from '../../shared/shared-image.service';
import * as _ from 'lodash';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserCommentResDto } from '../user-comments/dto/user-comment.dto';
import {
  RoomImageCombination,
  UserTagResDto,
} from '../user-tag/dto/user-tag.dto';
@Injectable()
export class UserImageService {
  private readonly AWS_S3_BUCKET_NAME = this.configService.get('BUCKET');
  private readonly s3 = new AWS.S3();
  private upload: RequestHandler;

  private createMulter(userId: string) {
    return multer({
      limits: { fieldSize: 25 * 1024 * 1024 },
      storage: multerS3({
        s3: this.s3,
        bucket: this.AWS_S3_BUCKET_NAME,
        acl: 'public-read',
        key: function (request, file, cb) {
          cb(null, `${userId}/${Date.now().toString()}-${file.originalname}`);
        },
      }),
    }).array('image', 1);
  }

  constructor(
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
    private configService: ConfigService,
    private sharedUserService: SharedUserService,
    private sharedRoomService: SharedRoomService,
    private sharedTagService: SharedTagService,
    private sharedImageService: SharedImageService,
  ) {
    AWS.config.update({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async getAllImages(currentUser: CoreUserDto): Promise<UserImageDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );

      const allUserImages = await this.userImageRepository.find({
        where: { user: activeCoreUser },
        relations: {
          personalRooms: true,
          userTags: true,
          user: true,
          userComments: {
            user: true,
          },
        },
      });

      const allImageIds = allUserImages.map((image) => image.id);

      await this.sharedImageService.checkAndAddImageDimensions(allImageIds);
      if (allUserImages) {
        const allUserImageDtos: UserImageDto[] = allUserImages.map(
          (userImageEntity) => {
            const userImageDto = plainToInstance(
              UserImageDto,
              instanceToPlain(userImageEntity),
              {
                excludeExtraneousValues: true,
              },
            );
            return {
              ...userImageDto,
              isOwner: activeCoreUser.id === userImageEntity.user.id,
            };
          },
        );
        return allUserImageDtos;
      } else {
        return [];
      }
    } catch (error) {
      throw new HttpException(
        {
          title: 'my_pictures.error.load_images.title',
          text: 'my_pictures.error.load_images.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserImage(
    currentUser: CoreUserDto,
    imageId: number,
    roomId?: number,
  ): Promise<UserImageDto> {
    const activeCoreUser = await this.sharedUserService.findByEmail(
      currentUser.email,
    );

    try {
      const imageEntity = await this.userImageRepository.findOne({
        where: { id: imageId },
        relations: {
          personalRooms: true,
          user: true,
          userTags: true,
          userComments: {
            user: true,
            personalRoom: true,
          },
        },
      });

      const imageDto = plainToInstance(
        UserImageDto,
        instanceToPlain(imageEntity),
        {
          excludeExtraneousValues: true,
        },
      );

      // creating userComments
      const userCommentDtos = roomId
        ? imageEntity.userComments
            .filter((userComment) => {
              return userComment.personalRoom.id === roomId;
            })
            .map((userComment) => {
              return plainToInstance(
                UserCommentResDto,
                instanceToPlain(userComment),
                {
                  excludeExtraneousValues: true,
                },
              );
            })
        : [];

      // creating userTags
      const userTagDtos = roomId
        ? imageEntity.userTags
            .filter((userTag) => {
              const combinationsObject = JSON.parse(
                userTag.roomImageCombinations,
              );
              return (combinationsObject as RoomImageCombination[]).some(
                (combination) => combination.roomId === roomId,
              );
            })
            .map((userTag) => {
              return plainToInstance(UserTagResDto, instanceToPlain(userTag), {
                excludeExtraneousValues: true,
              });
            })
        : [];

      return {
        ...imageDto,
        isOwner: activeCoreUser.id === imageEntity.user.id,
        userComments: userCommentDtos,
        userTags: userTagDtos,
      };
    } catch (error) {
      throw new HttpException(
        {
          title: 'my_pictures.error.load_images.title',
          text: 'my_pictures.error.load_images.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserImagesCount(
    currentUser: CoreUserDto,
    currentPage: number,
    filterObject?: ImageFilterQuery,
  ): Promise<PaginatedImagesResDto> {
    const imageCount = 10;
    const skip = (currentPage - 1) * imageCount;
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
        { guests: true, hosts: true },
      );

      const allUserImages = await this.userImageRepository.find({
        where: {
          user: filterObject.userIds
            ? { id: In(filterObject.userIds) }
            : { id: In([activeCoreUser.id]) },
        },
        order: { createdAt: 'DESC' },
        relations: {
          personalRooms: true,
          user: true,
        },
      });

      const roomFilterOptions = _.uniqBy(
        allUserImages.flatMap((userimage) => userimage.personalRooms),
        'id',
      );

      const tagFilterOptions = _.uniqBy(
        allUserImages.flatMap((userimage) => userimage.userTags),
        'id',
      );

      // filterByRooms
      const roomFilteredImages = filterObject.roomIds
        ? allUserImages.filter((image) => {
            return image.personalRooms.some((room) =>
              filterObject.roomIds.includes(room.id),
            );
          })
        : allUserImages;

      // filterByTags
      const tagFilteredImages = filterObject.tagIds
        ? roomFilteredImages.filter((image) => {
            return image.userTags.some((tag) =>
              filterObject.tagIds.includes(tag.id),
            );
          })
        : roomFilteredImages;

      if (tagFilteredImages) {
        const total = tagFilteredImages.length;
        const lastPage = Math.ceil(total / imageCount);
        const nextPage = currentPage + 1 > lastPage ? null : currentPage + 1;
        const prevPage = currentPage - 1 < 1 ? null : currentPage - 1;

        const countedUserImageDtos = tagFilteredImages
          .slice(skip, currentPage * imageCount)
          .map((userImageEntity) => {
            const userImageDto = plainToInstance(
              UserImageDto,
              instanceToPlain(userImageEntity),
              {
                excludeExtraneousValues: true,
              },
            );
            return {
              ...userImageDto,
              isOwner: activeCoreUser.id === userImageEntity.user.id,
            };
          });
        return {
          currentPage: currentPage,
          total: total,
          lastPage: lastPage,
          nextPage: nextPage,
          prevPage: prevPage,
          images: countedUserImageDtos,
          filterOptions: { rooms: roomFilterOptions, tags: tagFilterOptions },
        };
      } else {
        return {} as PaginatedImagesResDto;
      }
    } catch (error) {
      throw new HttpException(
        {
          title: 'my_pictures.error.load_images.title',
          text: 'my_pictures.error.load_images.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveUserImage(
    imagePath: string,
    imageKey: string,
    currentUser: CoreUserDto,
  ) {
    const activeCoreUser = await this.sharedUserService.findByEmail(
      currentUser.email,
    );

    const { width, height } = await this.sharedImageService.getImageDimensions(
      imagePath,
    );
    const imageEntity = this.userImageRepository.create({
      src: imagePath,
      key: imageKey,
      user: activeCoreUser,
      width: width,
      height: height,
    });
    const savedImageEntity = await this.userImageRepository.save(imageEntity);
    return plainToInstance(UserImageDto, instanceToPlain(savedImageEntity), {
      excludeExtraneousValues: true,
    });
  }

  async imageUpload(req: any, res: any, user: CoreUserDto) {
    try {
      this.upload = this.createMulter(String(user.userId));
      this.upload(req, res, async (error: any) => {
        if (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            title: 'my_pictures.error.upload_image.title',
            text: 'my_pictures.error.upload_image.message',
          });
        }
        if (req.files && req.files.length) {
          const imagePath = req.files[0].location as string;
          const imageKey = req.files[0].key as string;
          const savedUserImageEntity = await this.saveUserImage(
            imagePath,
            imageKey,
            user,
          );
          return res.status(201).json(savedUserImageEntity);
        } else {
          return res.status(HttpStatus.BAD_REQUEST).json({
            title: 'my_pictures.error.upload_image.title',
            text: 'my_pictures.error.upload_image.message',
          });
        }
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
        {
          title: 'my_pictures.error.upload_image.title',
          text: 'my_pictures.error.upload_image.message',
        },
        user.userId,
      );
    }
  }

  async updateImage(
    currentUser: CoreUserDto,
    editImage: EditImageDto,
  ): Promise<UserImageDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );

      const imageEntities = await this.userImageRepository.find({
        where: {
          user: activeCoreUser,
          id: In(editImage.imageIds),
        },
        relations: {
          personalRooms: true,
          user: true,
        },
      });

      const roomEntities = await this.sharedRoomService.findAnyByIds(
        editImage.personalRoomIds,
      );

      // getPresentTagEntities
      const existingTags: UserTag[] = [];
      if (editImage.usertagIds.length) {
        const existingTagEntitites = await this.sharedTagService.findByIds(
          activeCoreUser,
          editImage.usertagIds,
          { personalRooms: true, userImages: true },
        );
        const existingUpdatedWithRooms = existingTagEntitites.map(
          (existingTag) => {
            existingTag.personalRooms = [
              ...existingTag.personalRooms,
              ...roomEntities,
            ];

            return existingTag;
          },
        );
        existingTags.push(...existingUpdatedWithRooms);
      }

      // createNewTagEntities
      const newTags: UserTag[] = [];
      if (editImage.newUsertags.length) {
        const newUserTags = await this.sharedTagService.createTags(
          activeCoreUser,
          editImage.newUsertags,
          roomEntities,
        );
        newTags.push(...newUserTags);
      }

      const updatedImages = await Promise.all(
        imageEntities.map(async (imageEntity) => {
          imageEntity.personalRooms = roomEntities;
          imageEntity.userTags = [...existingTags, ...newTags];
          const savedImageEntity = await this.userImageRepository.save(
            imageEntity,
          );

          return plainToInstance(
            UserImageDto,
            instanceToPlain(savedImageEntity),
            {
              excludeExtraneousValues: true,
            },
          );
        }),
      );

      return updatedImages;
    } catch (error) {
      throw new HttpException(
        {
          title: 'my_pictures.error.edit_images.title',
          text: 'my_pictures.error.edit_images.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteImage(currentUser: CoreUserDto, imageId: number) {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );

      const imageEntity = await this.userImageRepository.findOne({
        where: {
          user: activeCoreUser,
          id: imageId,
        },
      });
      if (imageEntity) {
        this.s3.deleteObject(
          {
            Bucket: this.AWS_S3_BUCKET_NAME,
            Key: imageEntity.key,
          },
          (err) => {
            if (err) {
              throw new HttpException(
                {
                  title: 'my_pictures.error.delete_images.title',
                  text: 'my_pictures.error.delete_images.message',
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }
          },
        );
      }
      await this.userImageRepository.remove(imageEntity);
      return true;
    } catch (error) {
      throw new HttpException(
        {
          title: 'my_pictures.error.delete_images.title',
          text: 'my_pictures.error.delete_images.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
