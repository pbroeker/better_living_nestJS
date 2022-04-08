import { Module } from '@nestjs/common';
import { PersonalRoomsModule } from './personal-room/personal-room.module';
import { DatabaseModule } from '../core/database/database.module';
import { UserImageModule } from './user-image/user-image.module';

@Module({
  imports: [PersonalRoomsModule, DatabaseModule, UserImageModule],
})
export class FeatureModule {}
