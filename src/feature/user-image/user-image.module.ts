import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { UserImage } from './entity/user-image.entity';
import { UserImageController } from './user-image.controller';
import { UserImageService } from './user-image.service';
import { AmazonS3Service } from './aws-s3.service';

@Module({
  imports: [SharedModule, ConfigModule, TypeOrmModule.forFeature([UserImage])],
  controllers: [UserImageController],
  providers: [UserImageService, AmazonS3Service],
})
export class UserImageModule {}
