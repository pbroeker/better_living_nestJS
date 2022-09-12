import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
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
import { createRoomImageCombinations } from 'src/utils/features/helpers';
import * as sharp from 'sharp';
import { AmazonS3Service } from './aws-s3.service';
@Injectable()
export class UserImageService {
  constructor(
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
    private configService: ConfigService,
    private sharedUserService: SharedUserService,
    private sharedRoomService: SharedRoomService,
    private sharedTagService: SharedTagService,
    private sharedImageService: SharedImageService,
    private amazonS3Service: AmazonS3Service,
  ) {}

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
          userTags: true,
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
          filterOptions: {
            rooms: roomFilterOptions,
            tags: tagFilterOptions.map((filterTag) => {
              return plainToInstance(
                UserTagResDto,
                instanceToPlain(filterTag),
                {
                  excludeExtraneousValues: true,
                },
              );
            }),
          },
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

  async imageUpload(imageBuffer: Buffer, fileName: string, user: CoreUserDto) {
    try {
      const result = await this.amazonS3Service.uploadImageToS3(
        imageBuffer,
        user.userId,
        fileName,
      );
      return result as any;
      //   this.upload = this.createMulter(String(user.userId));
      //   this.upload(req, res, async (error: any) => {
      //     if (error) {
      //       return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      //         title: 'my_pictures.error.upload_image.title',
      //         text: 'my_pictures.error.upload_image.message',
      //       });
      //     }
      //     if (req.files && req.files.length) {
      //       const imagePath = req.files[0].location as string;
      //       const imageKey = req.files[0].key as string;
      //       const savedUserImageEntity = await this.saveUserImage(
      //         imagePath,
      //         imageKey,
      //         user,
      //       );
      //       return res.status(201).json(savedUserImageEntity);
      //     } else {
      //       return res.status(HttpStatus.BAD_REQUEST).json({
      //         title: 'my_pictures.error.upload_image.title',
      //         text: 'my_pictures.error.upload_image.message',
      //       });
      //     }
      //   });
    } catch (error) {
      return error;
      // return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
      //   {
      //     title: 'my_pictures.error.upload_image.title',
      //     text: 'my_pictures.error.upload_image.message',
      //   },
      //   user.userId,
      // );
    }
  }

  async reorientImage(
    imageBuffer: Buffer,
    fileName: string,
    user: CoreUserDto,
  ) {
    const orientedImage = await sharp(imageBuffer).rotate().toBuffer();
    return await this.imageUpload(orientedImage, fileName, user);
  }

  async updateImage(
    currentUser: CoreUserDto,
    editImage: EditImageDto,
  ): Promise<UserImageDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );

      const allUserTags = await this.sharedTagService.findAllOwned(
        activeCoreUser,
      );

      const imageEntities = await this.userImageRepository.find({
        where: {
          id: In(editImage.imageIds),
        },
        relations: {
          personalRooms: true,
          user: true,
          userTags: { personalRooms: true, userImages: true },
        },
      });

      const roomEntities = await this.sharedRoomService.findAnyByIds(
        editImage.personalRoomIds,
      );

      const roomImageCombinations = createRoomImageCombinations(
        editImage.personalRoomIds,
        editImage.imageIds,
      );

      // createNewTagEntities
      const newTags: UserTag[] = [];
      if (editImage.newUsertags.length) {
        editImage.newUsertags.forEach((newUserTag) => {
          const existingTitleTag = allUserTags.find(
            (existingUsertag) => existingUsertag.title === newUserTag,
          );
          if (existingTitleTag) {
            editImage.usertagIds.push(existingTitleTag.id);
          }
        });

        const noDoubleUserTags = editImage.newUsertags.filter((newUserTag) => {
          const doubleTag = allUserTags.find(
            (existingUsertag) => existingUsertag.title === newUserTag,
          );
          if (doubleTag) {
            editImage.usertagIds.push(doubleTag.id);
            return false;
          } else {
            return true;
          }
        });

        const newUserTags = await this.sharedTagService.createTags(
          activeCoreUser,
          noDoubleUserTags,
          roomEntities,
          roomImageCombinations,
        );
        newTags.push(...newUserTags);
      }

      const updatedImages = await Promise.all(
        imageEntities.map(async (imageEntity) => {
          // Edit existingTags
          const combinationsToEdit = createRoomImageCombinations(
            editImage.personalRoomIds,
            [imageEntity.id],
          );

          const editedTags = await this.sharedTagService.removeCombinations(
            imageEntity.userTags,
            editImage.usertagIds,
            combinationsToEdit,
            roomEntities,
          );

          // Adding rooms and Tags
          imageEntity.personalRooms = roomEntities;
          imageEntity.userTags = [...editedTags, ...newTags];

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
        relations: { userTags: { personalRooms: true } },
      });

      await this.amazonS3Service.deleteImageFromS3(imageEntity.key);

      const userTags = imageEntity.userTags.map((userTag) => {
        const roomsToKeepIds: number[] = [];
        const newCombinations = (
          JSON.parse(userTag.roomImageCombinations) as RoomImageCombination[]
        ).filter((combination) => {
          if (combination.imageId === imageId) {
            return false;
          } else {
            roomsToKeepIds.push(combination.roomId);
            return true;
          }
        });
        const newPersonalRooms = userTag.personalRooms.filter((room) =>
          roomsToKeepIds.includes(room.id),
        );
        userTag.personalRooms = newPersonalRooms;
        userTag.roomImageCombinations = JSON.stringify(newCombinations);
        return userTag;
      });

      await this.sharedTagService.editTags(userTags);

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
