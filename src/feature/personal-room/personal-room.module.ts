import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { PersonalRoom } from './entity/personalRoom.entity';
import { PersonalRoomController } from './personal-room.controller';
import { PersonalRoomService } from './personal-room.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([PersonalRoom])],
  controllers: [PersonalRoomController],
  providers: [PersonalRoomService],
})
export class PersonalRoomsModule {}
