import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';
import { InvitationToken } from './entity/invitation-token.entity';
import { InvitationTokenController } from './invitation-token.controller';
import { InvitationTokenService } from './invitation-token.service';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([InvitationToken])],
  providers: [InvitationTokenService],
  controllers: [InvitationTokenController],
})
export class InvitationTokenModule {}
