import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { SharedAuthService } from './shared-auth.service';
import { SharedUserService } from './shared-user.service';
import { SharedRoomService } from './shared-room.service';
import { PersonalRoom } from '../feature/personal-room/entity/personalRoom.entity';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([CoreUser, PersonalRoom])],
  providers: [SharedAuthService, SharedUserService, SharedRoomService],
  exports: [SharedAuthService, SharedUserService, SharedRoomService],
})
export class SharedModule {}
