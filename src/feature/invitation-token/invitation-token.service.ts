import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { Repository } from 'typeorm';
import { InvitationToken } from './entity/invitation-token.entity';

@Injectable()
export class InvitationTokenService {
  constructor(
    @InjectRepository(InvitationToken)
    private invitationTokenRepo: Repository<InvitationToken>,
  ) {}

  async createInvitationToken(inviter: CoreUserDto) {
    return null;
  }
}
