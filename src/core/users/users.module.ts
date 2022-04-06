import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { CoreUser } from './entity/user.entity';
import { SharedModule } from '../../shared/shared.module';
import { PersonalAreaService } from 'src/feature/personal-areas/personal-area.service';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';
import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CoreUser, PersonalRoom, PersonalArea]),
    SharedModule,
  ],
  providers: [UserService, PersonalAreaService],
  exports: [UserService],
})
export class UsersModule {}
