import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { SharedRoomService } from 'src/shared/shared-room.service';
import { removeUser } from '../../utils/features/helpers';
import { Repository } from 'typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import {
  EditImageRoomDto,
  PaginatedImagesResDto,
  UserImageDto,
} from './dto/user-image.dto';
import { UserImage } from './entity/user-image.entity';

@Injectable()
export class UserImageService {
  private readonly AWS_S3_BUCKET_NAME = this.configService.get('BUCKET');
  private readonly s3 = new AWS.S3();
  private readonly upload = multer({
    storage: multerS3({
      s3: this.s3,
      bucket: this.AWS_S3_BUCKET_NAME,
      acl: 'public-read',
      key: function (request, file, cb) {
        cb(null, `${Date.now().toString()} - ${file.originalname}`);
      },
    }),
  }).array('image', 1);

  constructor(
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
    private configService: ConfigService,
    private sharedUserService: SharedUserService,
    private sharedRoomService: SharedRoomService,
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
        relations: ['personalRooms'],
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
          title: 'images.error.load_images.title',
          text: 'images.error.load_images.message',
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
        relations: ['personalRooms'],
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
          title: 'images.error.load_images.title',
          text: 'images.error.load_images.message',
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
      this.upload(req, res, async (error: any) => {
        if (error) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            title: 'images.error.upload_image.title',
            text: 'images.error.upload_image.message',
          });
        }
        if (req.files.length) {
          const imagePath = req.files[0].location as string;
          const savedUserImageEntity = await this.saveUserImage(
            imagePath,
            user,
          );
          res.status(201).json(savedUserImageEntity);
        } else {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            title: 'images.error.upload_image.title',
            text: 'images.error.upload_image.message',
          });
        }
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        title: 'images.error.upload_image.title',
        text: 'images.error.upload_image.message',
      });
    }
  }

  async editRoomRelations(
    currentUser: CoreUserDto,
    imageId: number,
    editImage: EditImageRoomDto,
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

      const roomEntities = await this.sharedRoomService.findByIds(
        activeCoreUser,
        editImage.personalRoomIds,
      );

      imageEntity.personalRooms = roomEntities;
      const savedImageEntity = await this.userImageRepository.save(imageEntity);

      const { user, personalRooms, ...imageEntityNoUser } = savedImageEntity;

      return {
        ...imageEntityNoUser,
        personalRoomIds: editImage.personalRoomIds,
      };
    } catch (error) {
      throw new HttpException(
        {
          title: 'images.error.edit_images.title',
          text: 'images.error.edit_images.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
