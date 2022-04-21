import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { PersonalRoomController } from './personal-room.controller';
import { PersonalRoomService } from './personal-room.service';
import { PersonalRoom } from './entity/personalRoom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([PersonalRoom])],

  controllers: [PersonalRoomController],
  providers: [PersonalRoomService],
})
export class PersonalRoomsModule {}
