import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreUser } from '../core/user/entity/user.entity';
import { SharedAuthService } from './shared-auth.service';
import { SharedUserService } from './shared-user.service';
import { SharedAreaService } from './shared-area.service';
import { SharedRoomService } from './shared-room.service';
import { PersonalArea } from '../feature/personal-areas/entity/personalArea.entity';
import { PersonalRoom } from '../feature/personal-room/entity/personalRoom.entity';
import { UserImage } from '../feature/user-image/entity/user-image.entity';
import { SharedImageService } from './shared-image.service';
import { SharedTagService } from './shared-tag.service';
import { SharedCommentService } from './shared-comment.service';
import { AmazonS3Service } from './aws-s3.service';
import { UserTag } from '../feature/user-tag/entity/userTags.entity';
import { HttpModule } from '@nestjs/axios';
import { UserComment } from 'src/feature/user-comments/entity/userComment.entity';
@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([
      CoreUser,
      PersonalArea,
      PersonalRoom,
      UserImage,
      UserTag,
      UserComment,
    ]),
  ],
  providers: [
    SharedAuthService,
    SharedUserService,
    SharedRoomService,
    SharedAreaService,
    SharedImageService,
    SharedTagService,
    SharedCommentService,
    AmazonS3Service,
  ],
  exports: [
    SharedAuthService,
    SharedUserService,
    SharedRoomService,
    SharedAreaService,
    SharedImageService,
    SharedTagService,
    SharedCommentService,
    AmazonS3Service,
  ],
})
export class SharedModule {}
