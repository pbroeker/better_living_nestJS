import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { SharedAuthService } from './shared-auth.service';
import { SharedUserService } from './shared-user.service';
import { SharedAreaService } from './shared-area.service';
import { SharedRoomService } from './shared-room.service';
import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([CoreUser, PersonalArea, PersonalRoom]),
  ],
  providers: [
    SharedAuthService,
    SharedUserService,
    SharedRoomService,
    SharedAreaService,
  ],
  exports: [
    SharedAuthService,
    SharedUserService,
    SharedRoomService,
    SharedAreaService,
  ],
})
export class SharedModule {}
