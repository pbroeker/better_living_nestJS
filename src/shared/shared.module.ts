import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalArea } from '../feature/personal-areas/entity/personalArea.entity';
import { CoreUser } from '../core/users/entity/user.entity';
import { SharedAuthService } from './shared-auth.service';
import { SharedUserService } from './shared-user.service';
import { SharedAreaService } from './shared-area.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([CoreUser, PersonalArea])],
  providers: [SharedAuthService, SharedUserService, SharedAreaService],
  exports: [SharedAuthService, SharedUserService, SharedAreaService],
})
export class SharedModule {}
