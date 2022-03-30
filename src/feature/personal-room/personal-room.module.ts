import { Module } from '@nestjs/common';
import { PersonalRoomController } from './personal-room.controller';
import { PersonalRoomService } from './personal-room.service';
import { PersonalRoom } from './entity/personalRoom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreUser } from 'src/core/users/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PersonalRoom, CoreUser])],
  controllers: [PersonalRoomController],
  providers: [PersonalRoomService],
})
export class PersonalRoomsModule {}
