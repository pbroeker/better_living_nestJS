import { Module } from '@nestjs/common';
import { PersonalRoomsModule } from './personal-room/personal-room.module';
import { DatabaseModule } from '../core/database/database.module';

@Module({
  imports: [PersonalRoomsModule, DatabaseModule],
})
export class FeatureModule {}
