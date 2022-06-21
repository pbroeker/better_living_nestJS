import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedGuestService } from '../../shared/shared-guest.service';
import { CoreUser } from '../../core/users/entity/user.entity';
import { SharedAreaService } from '../../shared/shared-area.service';
import { Repository } from 'typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import {
  InvitationTokenResDto,
  PendingInvitationResDto,
} from './dto/invitation-token.dto';
import { InvitationToken } from './entity/invitation-token.entity';
import { GuestUserDto } from '../guest-user/dto/guest-user.dto';
import { GuestUser } from '../guest-user/entity/guestUser.entity';

@Injectable()
export class InvitationTokenService {
  constructor(
    @InjectRepository(InvitationToken)
    private invitationTokenRepo: Repository<InvitationToken>,
    private sharedUserService: SharedUserService,
    private sharedGuestService: SharedGuestService,
    private sharedAreaService: SharedAreaService,
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
        // Making sure you can't invite yourself
        if (foundInvitationToken.inviter.id === activeCoreUser.id) {
          throw new HttpException(
            {
              title: 'invitation_token.error.expired.title',
              text: 'invitation_token.error.expired.message',
            },
            HttpStatus.FORBIDDEN,
          );
        }

        const existingUser =
          await this.sharedGuestService.checkForExistingGuest(
            foundInvitationToken.inviter,
          );

        // Only adding guest if it doesn't exist yet
        let guestEntity: GuestUser;
        if (!existingUser) {
          guestEntity = await this.sharedGuestService.addGuest(
            foundInvitationToken.inviter,
            activeCoreUser,
          );

          await this.addGuestToInviterAreas(
            foundInvitationToken.inviter,
            activeCoreUser,
          );
        } else {
          const hostIds = existingUser.hosts.map((host) => host.id);
          if (!hostIds.includes(activeCoreUser.id)) {
            guestEntity = await this.sharedGuestService.updateGuest(
              foundInvitationToken.inviter,
              existingUser,
            );

            await this.addGuestToInviterAreas(
              foundInvitationToken.inviter,
              activeCoreUser,
            );
          } else {
            guestEntity = await this.sharedGuestService.findGuestByMail(
              existingUser.guest_email,
            );
          }
        }

        // Deleting used invitationToken
        await this.invitationTokenRepo.delete(foundInvitationToken.id);

        const guestUserDto: GuestUserDto = {
          core_user_id: activeCoreUser.id,
          hostIds: guestEntity.hosts.map((host) => host.id),
          guest_email: activeCoreUser.user_email,
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

  private async addGuestToInviterAreas(inviter: CoreUser, guestUser: CoreUser) {
    const inviterAreas = await this.sharedAreaService.findAllOwned(inviter, [
      'users',
    ]);

    const updatedInviterAreas = inviterAreas.map((inviterArea) => {
      return { ...inviterArea, users: [...inviterArea.users, guestUser] };
    });

    const savedInviterAreas = await this.sharedAreaService.updateAreas(
      updatedInviterAreas,
    );

    return savedInviterAreas;
  }

  async getPendingInvitations(user: CoreUserDto) {
    const activeCoreUser = await this.sharedUserService.findByEmail(user.email);
    const foundInvitationTokens = await this.invitationTokenRepo.find({
      where: { inviter: activeCoreUser },
    });
    return foundInvitationTokens.map((token) => {
      return {
        id: token.id,
        createdAt: token.createdAt,
      } as PendingInvitationResDto;
    });
  }
}
