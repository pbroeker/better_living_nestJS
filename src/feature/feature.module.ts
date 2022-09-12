import { Module } from '@nestjs/common';
import { PersonalRoomsModule } from './personal-room/personal-room.module';
import { DatabaseModule } from '../core/database/database.module';
import { PersonalAreaModule } from './personal-areas/personal-area.module';
import { UserImageModule } from './user-image/user-image.module';
import { UserTagsModule } from './user-tag/user-tag.module';
import { GuestUserModule } from './guest-user/guest-user.module';
import { InvitationTokenModule } from './invitation-token/invitation-token.module';
import { UserCommentModule } from './user-comments/user-comment.module';
@Module({
  imports: [
    PersonalRoomsModule,
    DatabaseModule,
    UserImageModule,
    PersonalAreaModule,
    UserTagsModule,
    InvitationTokenModule,
    GuestUserModule,
    UserCommentModule,
  ],
})
export class FeatureModule {}
