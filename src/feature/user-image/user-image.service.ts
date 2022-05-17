import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { SharedRoomService } from '../../shared/shared-room.service';
import { removeUser } from '../../utils/features/helpers';
import { Repository } from 'typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import {
  EditImageDto,
  PaginatedImagesResDto,
  UserImageDto,
} from './dto/user-image.dto';
import { UserImage } from './entity/user-image.entity';
import { RequestHandler } from '@nestjs/common/interfaces';
import { UserTag } from '../user-tag/entity/userTags.entity';
import { SharedTagService } from 'src/shared/shared-tag.service';

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
  ) {
    AWS.config.update({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async getUserImages(currentUser: CoreUserDto): Promise<UserImageDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );
      const allUserImages = await this.userImageRepository.find({
        where: { user: activeCoreUser },
        relations: ['personalRooms', 'userTags'],
      });
      if (allUserImages) {
        const allUserImageDtos = allUserImages.map((userImageEntity) => {
          const imageEntityNoUser = removeUser(userImageEntity);

          return {
            ...imageEntityNoUser,
            personalRooms: imageEntityNoUser.personalRooms.map(
              (personalRoom) => personalRoom.id,
            ),
          };
        });
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

  async getUserImagesCount(
    currentUser: CoreUserDto,
    page: number,
  ): Promise<PaginatedImagesResDto> {
    const imageCount = 10;
    const skip = (page - 1) * imageCount;
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );
      const countedUserImages = await this.userImageRepository.findAndCount({
        where: { user: activeCoreUser },
        order: { createdAt: 'DESC' },
        take: imageCount,
        skip: skip,
        relations: ['personalRooms', 'userTags'],
      });

      if (countedUserImages) {
        const total = countedUserImages[1];
        const lastPage = Math.ceil(total / imageCount);
        const nextPage = page + 1 > lastPage ? null : page + 1;
        const prevPage = page - 1 < 1 ? null : page - 1;
        const countedUserImageDtos = countedUserImages[0].map(
          (userImageEntity) => {
            const imageEntityNoUser = removeUser(userImageEntity);

            return {
              ...imageEntityNoUser,
              personalRooms: imageEntityNoUser.personalRooms.map(
                (personalRoom) => personalRoom.id,
              ),
            };
          },
        );
        return {
          currentPage: page,
          total: total,
          lastPage: lastPage,
          nextPage: nextPage,
          prevPage: prevPage,
          images: countedUserImageDtos,
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

  async saveUserImage(imagePath: string, currentUser: CoreUserDto) {
    const activeCoreUser = await this.sharedUserService.findByEmail(
      currentUser.email,
    );
    const imageEntity = this.userImageRepository.create({
      src: imagePath,
      user: activeCoreUser,
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
        if (req.files.length) {
          const imagePath = req.files[0].location as string;
          const savedUserImageEntity = await this.saveUserImage(
            imagePath,
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

  async editRoomRelations(
    currentUser: CoreUserDto,
    imageId: number,
    editImage: EditImageDto,
  ): Promise<UserImageDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );

      const imageEntity = await this.userImageRepository.findOne({
        where: {
          user: activeCoreUser,
          id: imageId,
        },
        relations: ['personalRooms'],
      });

      // getPresentTagEntities
      const oldTags: UserTag[] = [];
      if (editImage.usertagIds.length) {
        const oldUserTags = await this.sharedTagService.findByIds(
          activeCoreUser,
          editImage.usertagIds,
        );
        oldTags.push(...oldUserTags);
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

      const roomEntities = await this.sharedRoomService.findByIds(
        activeCoreUser,
        editImage.personalRoomIds,
      );

      imageEntity.personalRooms = roomEntities;
      imageEntity.userTags = [...oldTags, ...newTags];
      const savedImageEntity = await this.userImageRepository.save(imageEntity);
      const userTagsNoUser = savedImageEntity.userTags.map((userTag) => {
        const { user, createdAt, updatedAt, ...userTagNoUser } = userTag;
        return userTagNoUser;
      });
      const { user, personalRooms, ...imageEntityNoUser } = savedImageEntity;

      return {
        ...imageEntityNoUser,
        personalRoomIds: editImage.personalRoomIds,
        userTags: userTagsNoUser,
      };
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
}
