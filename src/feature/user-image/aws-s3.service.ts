import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AmazonS3Service {
  constructor(private readonly configService: ConfigService) {}

  async deleteImageFromS3(userImageKey: string) {
    const s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
    await s3
      .deleteObject(
        {
          Bucket: this.configService.get('BUCKET'),
          Key: userImageKey,
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
      )
      .promise();

    return true;
  }

  async uploadImageToS3(
    dataBuffer: Buffer,
    userId: number,
    originalname: string,
  ) {
    const s3 = new S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
    });
    const uploadResult = await s3
      .upload(
        {
          ACL: 'public-read',
          Bucket: this.configService.get('BUCKET'),
          Body: dataBuffer,
          Key: `${userId}/${Date.now().toString()}-${originalname}`,
        },
        (err, data) => {
          if (err) {
            throw new HttpException(
              {
                title: 'my_pictures.error.upload_image.title',
                text: 'my_pictures.error.upload_image.message',
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          return data;
        },
      )
      .promise();

    return uploadResult;
  }
}
