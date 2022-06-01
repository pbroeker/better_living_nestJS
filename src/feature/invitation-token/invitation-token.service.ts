import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedGuestService } from '../../shared/shared-guest.service';
import { Repository } from 'typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { InvitationTokenResDto } from './dto/invitation-token.dto';
import { InvitationToken } from './entity/invitation-token.entity';
import { GuestUserDto } from '../user-guest/dto/guest-user.dto';

@Injectable()
export class InvitationTokenService {
  constructor(
    @InjectRepository(InvitationToken)
    private invitationTokenRepo: Repository<InvitationToken>,
    private sharedUserService: SharedUserService,
    private sharedGuestService: SharedGuestService,
  ) {}

  async createInvitationToken(inviter: CoreUserDto) {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        inviter.email,
      );
      const newInvitationTokenEntity = this.invitationTokenRepo.create({
        inviter: activeCoreUser,
      });
      const savedInvitationTokenEntity = await this.invitationTokenRepo.save(
        newInvitationTokenEntity,
      );
      return {
        invitationToken: savedInvitationTokenEntity.token,
        inviter: activeCoreUser.user_email,
      } as InvitationTokenResDto;
    } catch (error) {
      throw new HttpException(
        {
          title: 'invitation_token.error.create_token.title',
          text: 'invitation_token.error.create_token.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkInvitationToken(
    invitedUser: CoreUserDto,
    invitationToken: string,
  ): Promise<GuestUserDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        invitedUser.email,
      );

      const foundInvitationToken = await this.invitationTokenRepo.findOne({
        where: { token: invitationToken },
        relations: ['inviter'],
      });

      if (foundInvitationToken) {
        const guestUserEntity = await this.sharedGuestService.addGuest(
          foundInvitationToken.inviter,
          activeCoreUser,
        );

        // Deleting used invitationToken
        await this.invitationTokenRepo.delete(foundInvitationToken.id);
        const guestUserDto: GuestUserDto = {
          hostmail: guestUserEntity.host.user_email,
          guestmail: guestUserEntity.guest_email,
        };
        return guestUserDto;
      } else {
        throw new HttpException(
          {
            title: 'invitation_token.error.expired.title',
            text: 'invitation_token.error.expired.message',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          title: error.response?.title
            ? error.response.title
            : 'invitation_token.error.check_token.title',
          text: error.response?.text
            ? error.response.text
            : 'invitation_token.error.check_token.title',
        },
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
