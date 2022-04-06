import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { SharedAuthService } from './shared-auth.service';
import { SharedUserService } from './shared-user.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([CoreUser])],
  providers: [SharedAuthService, SharedUserService],
  exports: [SharedAuthService, SharedUserService],
})
export class SharedModule {}
