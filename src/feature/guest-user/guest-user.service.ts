import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { Repository } from 'typeorm';
import { GuestUser } from './entity/guestUser.entity';
import { GuestUserDto } from './dto/guest-user.dto';
import { SharedAreaService } from 'src/shared/shared-area.service';
import { SharedImageService } from 'src/shared/shared-image.service';

@Injectable()
export class GuestUserService {
  constructor(
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
    private sharedAreaService: SharedAreaService,
    @InjectRepository(GuestUser)
    private guestUserRepository: Repository<GuestUser>,
  ) {}

  async getAllGuests(user: CoreUserDto): Promise<GuestUserDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
        {
          guests: {
            hosts: true,
          },
        },
      );

      const guestUserDtos: GuestUserDto[] = activeCoreUser.guests.map(
        (guest) => {
          return {
            id: guest.id,
            hostIds: guest.hosts.map((host) => host.id),
            core_user_id: guest.core_user_id,
            guest_email: guest.guest_email,
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
    user: CoreUserDto,
    guestCoreId: number,
  ): Promise<GuestUserDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
        { guests: true },
      );

      const guestCoreUserEntity = await this.sharedUserService.findById(
        guestCoreId,
      );

      const personalAreas = await this.sharedAreaService.findAllOwned(
        activeCoreUser,
        ['users', 'personalRooms'],
      );

      const hostRoomIds = personalAreas
        .flatMap((personalArea) => personalArea.personalRooms)
        .map((room) => room.id);

      // Removing guest from personalAreas
      await this.sharedAreaService.removeUserFromArea(
        personalAreas,
        guestCoreId,
      );

      // Removing guest-images from personalRooms
      await this.sharedImageService.removeRoomsFromImages(
        guestCoreUserEntity,
        hostRoomIds,
      );

      // // Removing guest from activeCoreUser.guests
      const updatedUser = await this.sharedUserService.removeGuest(
        activeCoreUser,
        guestCoreId,
      );

      // Delete guest if he has no more hosts
      const guestEntity = await this.guestUserRepository.findOne({
        where: { core_user_id: guestCoreId },
        relations: ['hosts'],
      });

      if (!guestEntity.hosts.length) {
        await this.guestUserRepository.delete(guestEntity.id);
      }

      const guestUserDtos = updatedUser.guests.map((guest) => {
        const { hosts, ...guestNoDates } = guest;
        return guestNoDates;
      });

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
