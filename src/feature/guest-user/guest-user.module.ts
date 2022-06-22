import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { GuestUserController } from './guest-user.controller';
import { GuestUserService } from './guest-user.service';

@Module({
  controllers: [GuestUserController],
  imports: [SharedModule],
  providers: [GuestUserService],
})
export class GuestUserModule {}
