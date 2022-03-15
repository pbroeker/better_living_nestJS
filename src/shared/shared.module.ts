import { Module } from '@nestjs/common';
import { SharedAuthServiceService } from './shared-auth-service/shared-auth-service.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SharedAuthServiceService],
  exports: [SharedAuthServiceService],
})
export class SharedModule {}
