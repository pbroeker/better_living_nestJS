import { Module } from '@nestjs/common';
import { PersonalRoomsModule } from './personal-room/personal-room.module';
import { DatabaseModule } from '../core/database/database.module';
import { PersonalAreaModule } from './personal-areas/personal-area.module';

@Module({
  imports: [PersonalRoomsModule, DatabaseModule, PersonalAreaModule],
})
export class FeatureModule {}
