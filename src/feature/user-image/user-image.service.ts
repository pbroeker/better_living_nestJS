import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';
import { Repository } from 'typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { UserImageDto } from './dto/user-image.dto';
import { UserImage } from './entity/user-image.entity';

@Injectable()
export class UserImageSevice {
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
      });
      if (allUserImages) {
        const allUserImageDtos = allUserImages.map((userImageEntity) => {
          const { user, ...imageEntityNoUser } = userImageEntity;
          return imageEntityNoUser as UserImageDto;
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

  async saveUserImage(imagePath: string, currentUser: CoreUserDto) {
    const activeCoreUser = await this.sharedUserService.findByEmail(
      currentUser.email,
    );
    const imageEntity = this.userImageRepository.create({
      src: imagePath,
      user: activeCoreUser,
    });
    const savedImageEntity = await this.userImageRepository.save(imageEntity);
    const { user, ...imageEntityNoUser } = savedImageEntity;
    return imageEntityNoUser as UserImageDto;
  }

  async imageUpload(req: any, res: any, user: CoreUserDto) {
    try {
      this.upload(req, res, async (error: any) => {
        if (error) {
          throw new HttpException(
            {
              title: 'images.error.upload_image.title',
              text: 'images.error.upload_image.message',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
        const imagePath = req.files[0].location as string;
        const savedUserImageEntity = await this.saveUserImage(imagePath, user);
        return res.status(201).json(savedUserImageEntity);
      });
    } catch (error) {
      throw new HttpException(
        {
          title: 'images.error.upload_image.title',
          text: 'images.error.upload_image.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
