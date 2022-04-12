import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { PersonalRoomController } from './personal-room.controller';
import { PersonalRoomService } from './personal-room.service';
import { PersonalRoom } from './entity/personalRoom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalArea } from '../personal-areas/entity/personalArea.entity';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([PersonalRoom, PersonalArea]),
  ],

  controllers: [PersonalRoomController],
  providers: [PersonalRoomService],
})
export class PersonalRoomsModule {}
