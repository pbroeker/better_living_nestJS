import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
import { GuestUserResDto } from '../guest-user/dto/guest-user.dto';

@Injectable()
export class InvitationTokenService {
  constructor(
    @InjectRepository(InvitationToken)
    private invitationTokenRepo: Repository<InvitationToken>,
    private sharedUserService: SharedUserService,
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
  ): Promise<GuestUserResDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        invitedUser.email,
        { guests: true, hosts: true },
      );

      const foundInvitationToken = await this.invitationTokenRepo.findOne({
        where: { token: invitationToken },
        relations: { inviter: true },
      });
      if (foundInvitationToken) {
        // Making sure you can't invite yourself
        if (foundInvitationToken.inviter.id === activeCoreUser.id) {
          throw new HttpException(
            {
              title: 'invitation_token.error.self_invite.title',
              text: 'invitation_token.error.self_invite.message',
            },
            HttpStatus.BAD_REQUEST,
          );
        }

        // get coreUserEntity of host
        const hostEntity = await this.sharedUserService.findByEmail(
          foundInvitationToken.inviter.user_email,
          { guests: true },
        );

        // Only adding guest if it doesn't exist yet
        const guestIds = hostEntity.guests.map((guest) => guest.id);
        if (guestIds.includes(activeCoreUser.id)) {
          return {
            ...activeCoreUser,
            guestIds: activeCoreUser.guests.map((guest) => guest.id),
            hostIds: activeCoreUser.hosts.map((host) => host.id),
            id: activeCoreUser.id,
          };
        } else {
          const newActiveCoreUser = await this.sharedUserService.addGuest(
            hostEntity,
            activeCoreUser,
          );
          // Adding guest to inviters areas
          await this.addGuestToInviterAreas(hostEntity, newActiveCoreUser);
          // Deleting used invitationToken
          await this.invitationTokenRepo.delete(foundInvitationToken.id);
          const {
            currentHashedRefreshToken,
            user_password,
            hosts,
            guests,
            ...newActiveCoreUserNoPW
          } = newActiveCoreUser;
          return {
            ...newActiveCoreUserNoPW,
            guestIds: newActiveCoreUser.guests.map((guest) => guest.id),
            hostIds: newActiveCoreUser.hosts.map((host) => host.id),
            id: newActiveCoreUser.id,
          };
        }
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
