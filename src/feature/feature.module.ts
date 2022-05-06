import { Module } from '@nestjs/common';
import { PersonalRoomsModule } from './personal-room/personal-room.module';
import { DatabaseModule } from '../core/database/database.module';
import { PersonalAreaModule } from './personal-areas/personal-area.module';
import { UserImageModule } from './user-image/user-image.module';
import { UserTagsModule } from './user-tags/user-tags.module';
@Module({
  imports: [
    PersonalRoomsModule,
    DatabaseModule,
    UserImageModule,
    PersonalAreaModule,
    UserTagsModule,
  ],
})
export class FeatureModule {}
