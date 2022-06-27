import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedAreaService } from 'src/shared/shared-area.service';
import { SharedImageService } from 'src/shared/shared-image.service';
import { GuestUserResDto } from './dto/guest-user.dto';
import { getUserInitials } from 'src/utils/features/helpers';

@Injectable()
export class GuestUserService {
  constructor(
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
    private sharedAreaService: SharedAreaService,
  ) {}

  async getAllHosts(user: CoreUserDto): Promise<GuestUserResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
        {
          hosts: { guests: true },
        },
      );

      const hostUserDtos: GuestUserResDto[] = activeCoreUser.hosts.map(
        (host) => {
          const {
            user_password,
            currentHashedRefreshToken,
            guests,
            hosts,
            ...hostNoPW
          } = host;
          return {
            ...hostNoPW,
            guestIds: host.guests.map((guest) => guest.id),
            userInitials: getUserInitials(host),
            host_email: host.user_email,
          };
        },
      );
      return hostUserDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'user-guest.error.get_all_hosts.title',
          text: 'user-guest.error.get_all_hosts.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllGuests(user: CoreUserDto): Promise<GuestUserResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
        {
          guests: { hosts: true },
        },
      );

      const guestUserDtos: GuestUserResDto[] = activeCoreUser.guests.map(
        (guest) => {
          const {
            user_password,
            currentHashedRefreshToken,
            hosts,
            guests,
            ...guestNoPW
          } = guest;

          return {
            ...guestNoPW,
            hostIds: guest.hosts.map((guest) => guest.id),
            userInitials: getUserInitials(guest),
            guest_email: guest.user_email,
          };
        },
      );
      return guestUserDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'user-guest.error.get_all_guest.title',
          text: 'user-guest.error.get_all_guest.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUser(hostId: number, guestId: number): Promise<boolean> {
    try {
      const hostUser = await this.sharedUserService.findById(hostId, {
        guests: true,
      });

      const guestEntity = await this.sharedUserService.findById(guestId);

      // Making sure it is not possible to delete myself
      if (hostId === guestId) {
        throw new HttpException(
          {
            title: 'user-guest.error.delete_guest.title',
            text: 'user-guest.error.delete_guest.message',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // Removing guest from personalAreas
      const personalAreas = await this.sharedAreaService.findAllOwned(
        hostUser,
        { users: true, personalRooms: true },
      );

      await this.sharedAreaService.removeUserFromArea(personalAreas, guestId);

      // Removing guest-images from personalRooms
      const hostRoomIds = personalAreas
        .flatMap((personalArea) => personalArea.personalRooms)
        .map((room) => room.id);

      await this.sharedImageService.removeRoomsFromImages(
        guestEntity,
        hostRoomIds,
      );

      // // Removing guest from activeCoreUser.guests
      const updatedUser = await this.sharedUserService.removeGuest(
        hostUser,
        guestId,
      );

      return updatedUser ? true : false;
    } catch (error) {
      console.log('error: ', error);
      throw new HttpException(
        {
          title: 'user-guest.error.delete_guest.title',
          text: 'user-guest.error.delete_guest.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
