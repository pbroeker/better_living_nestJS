import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { GuestUserController } from './guest-user.controller';
import { GuestUserService } from './guest-user.service';
import { GuestUser } from './entity/guestUser.entity';

@Module({
  controllers: [GuestUserController],
  imports: [SharedModule, TypeOrmModule.forFeature([GuestUser])],
  providers: [GuestUserService],
})
export class GuestUserModule {}
