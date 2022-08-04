import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { SharedRoomService } from '../../shared/shared-room.service';
import { getUserInitials, removeUser } from '../../utils/features/helpers';
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
import { SharedImageService } from 'src/shared/shared-image.service';
import * as _ from 'lodash';
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
        relations: ['personalRooms', 'userTags', 'user'],
      });

      const allImageIds = allUserImages.map((image) => image.id);

      await this.sharedImageService.checkAndAddImageDimensions(allImageIds);
      if (allUserImages) {
        const allUserImageDtos: UserImageDto[] = allUserImages.map(
          (userImageEntity) => {
            const imageEntityNoUser = removeUser(userImageEntity);
            const { personalRooms, ...imageEntityNoRooms } = imageEntityNoUser;
            return {
              ...imageEntityNoRooms,
              ownerInitials: getUserInitials(userImageEntity.user),
              isOwner: activeCoreUser.id === userImageEntity.user.id,
              personalRooms: imageEntityNoUser.personalRooms.map(
                (personalRoom) => {
                  return {
                    id: personalRoom.id,
                    iconId: personalRoom.iconId,
                    title: personalRoom.title,
                  };
                },
              ),
              userTags: imageEntityNoRooms.userTags.map((userTag) => {
                const { ...tagNoDates } = userTag;
                return tagNoDates;
              }),
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
  ): Promise<UserImageDto> {
    const activeCoreUser = await this.sharedUserService.findByEmail(
      currentUser.email,
    );

    try {
      const imageEntity = await this.userImageRepository.findOne({
        where: { id: imageId },
        relations: ['personalRooms', 'userTags', 'user'],
      });

      const imageDtoNoUser = removeUser(imageEntity);
      const { personalRooms, ...imageDtoNoRooms } = imageDtoNoUser;

      return {
        ...imageDtoNoRooms,
        isOwner: activeCoreUser.id === imageEntity.user.id,
        ownerInitials: getUserInitials(imageEntity.user),
        personalRooms: imageDtoNoUser.personalRooms.map((personalRoom) => {
          return {
            id: personalRoom.id,
            iconId: personalRoom.iconId,
            title: personalRoom.title,
          };
        }),
        userTags: imageDtoNoRooms.userTags.map((userTag) => {
          const { ...tagNoDates } = userTag;
          return tagNoDates;
        }),
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
        relations: ['personalRooms', 'userTags', 'user'],
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
            const imageEntityNoUser = removeUser(userImageEntity);
            const { personalRooms, ...imageEntityNoRooms } = imageEntityNoUser;
            return {
              ...imageEntityNoRooms,
              isOwner: activeCoreUser.id === userImageEntity.user.id,
              ownerInitials: getUserInitials(userImageEntity.user),
              personalRooms: imageEntityNoUser.personalRooms.map(
                (personalRoom) => {
                  return {
                    id: personalRoom.id,
                    iconId: personalRoom.iconId,
                    title: personalRoom.title,
                  };
                },
              ),
              userTags: imageEntityNoUser.userTags.map((userTag) => {
                const { ...tagNoDates } = userTag;
                return tagNoDates;
              }),
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
    const { user, personalRooms, ...imageEntityNoUser } = savedImageEntity;
    return imageEntityNoUser;
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
        relations: ['personalRooms', 'user'],
      });

      // getPresentTagEntities
      const existingTags: UserTag[] = [];
      if (editImage.usertagIds.length) {
        const existingTagEntitites = await this.sharedTagService.findByIds(
          activeCoreUser,
          editImage.usertagIds,
        );
        existingTags.push(...existingTagEntitites);
      }

      // createNewTagEntities
      const newTags: UserTag[] = [];
      if (editImage.newUsertags.length) {
        const newUserTags = await this.sharedTagService.createTags(
          activeCoreUser,
          editImage.newUsertags,
        );
        newTags.push(...newUserTags);
      }

      const roomEntities = await this.sharedRoomService.findAnyByIds(
        editImage.personalRoomIds,
      );

      const updatedImages = await Promise.all(
        imageEntities.map(async (imageEntity) => {
          imageEntity.personalRooms = roomEntities;
          imageEntity.userTags = [...existingTags, ...newTags];
          const savedImageEntity = await this.userImageRepository.save(
            imageEntity,
          );
          const userTagsNoUser = savedImageEntity.userTags.map((userTag) => {
            const { user, ...userTagNoUser } = userTag;
            return userTagNoUser;
          });
          const { user, personalRooms, ...imageEntityNoUser } =
            savedImageEntity;

          return {
            ...imageEntityNoUser,
            ownerInitials: getUserInitials(savedImageEntity.user),
            isOwner: activeCoreUser.id === savedImageEntity.user.id,
            personalRooms: roomEntities.map((personalRoom) => {
              return {
                id: personalRoom.id,
                iconId: personalRoom.iconId,
                title: personalRoom.title,
              };
            }),
            userTags: userTagsNoUser,
          };
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
              console.error(err);
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
