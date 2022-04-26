import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { UserImage } from './entity/user-image.entity';
import { UserImageController } from './user-image.controller';
import { UserImageService } from './user-image.service';

@Module({
  imports: [SharedModule, ConfigModule, TypeOrmModule.forFeature([UserImage])],
  controllers: [UserImageController],
  providers: [UserImageService],
})
export class UserImageModule {}
