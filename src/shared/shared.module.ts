import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { SharedAuthService } from './shared-auth.service';
import { SharedUserService } from './shared-user.service';
import { SharedAreaService } from './shared-area.service';
import { SharedRoomService } from './shared-room.service';
import { PersonalArea } from '../feature/personal-areas/entity/personalArea.entity';
import { PersonalRoom } from '../feature/personal-room/entity/personalRoom.entity';
import { UserImage } from '../feature/user-image/entity/user-image.entity';
import { SharedImageService } from './shared-image.service';
import { SharedTagService } from './shared-tag.service';
import { UserTag } from 'src/feature/user-tag/entity/userTags.entity';
@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      CoreUser,
      PersonalArea,
      PersonalRoom,
      UserImage,
      UserTag,
    ]),
  ],
  providers: [
    SharedAuthService,
    SharedUserService,
    SharedRoomService,
    SharedAreaService,
    SharedImageService,
    SharedTagService,
  ],
  exports: [
    SharedAuthService,
    SharedUserService,
    SharedRoomService,
    SharedAreaService,
    SharedImageService,
    SharedTagService,
  ],
})
export class SharedModule {}
