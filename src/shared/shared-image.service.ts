import {
  HttpException,
  HttpStatus,
  Injectable,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as multer from 'multer';
import * as multerS3 from 'multer-s3';

@Injectable()
export class SharedImageService {
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

  constructor(private configService: ConfigService) {
    AWS.config.update({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async imageUpload(@Req() req: any, @Res() res: any) {
    try {
      this.upload(req, res, function (error) {
        if (error) {
          console.log(error);
          throw new HttpException(
            {
              title: 'images.error.upload_image.title',
              text: 'images.error.upload_image.message',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        return res.status(201).json(req.files[0].location);
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
