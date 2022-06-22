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
          return {
            core_user_id: guest.id,
            hostIds: guest.hosts.map((guest) => guest.id),
            guestInitals: getUserInitials(guest),
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

  async deleteGuestUser(
    hostUser: CoreUserDto,
    guestId: number,
  ): Promise<GuestUserResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        hostUser.email,
        { guests: true },
      );

      // Making sure it is not possible to delete myself
      if (activeCoreUser.id === guestId) {
        throw new HttpException(
          {
            title: 'user-guest.error.delete_guest.title',
            text: 'user-guest.error.delete_guest.message',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const guestCoreUserEntity = await this.sharedUserService.findById(
        guestId,
      );

      // Removing guest from personalAreas
      const personalAreas = await this.sharedAreaService.findAllOwned(
        activeCoreUser,
        { users: true, personalRooms: true },
      );

      await this.sharedAreaService.removeUserFromArea(personalAreas, guestId);

      // Removing guest-images from personalRooms
      const hostRoomIds = personalAreas
        .flatMap((personalArea) => personalArea.personalRooms)
        .map((room) => room.id);

      await this.sharedImageService.removeRoomsFromImages(
        guestCoreUserEntity,
        hostRoomIds,
      );

      // // Removing guest from activeCoreUser.guests
      const updatedUser = await this.sharedUserService.removeGuest(
        activeCoreUser,
        guestId,
      );

      const guestUserDtos: GuestUserResDto[] = updatedUser.guests.map(
        (guest) => {
          return {
            core_user_id: guest.id,
            hostIds: guest.hosts.map((host) => host.id),
          };
        },
      );

      return guestUserDtos;
    } catch (error) {
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
