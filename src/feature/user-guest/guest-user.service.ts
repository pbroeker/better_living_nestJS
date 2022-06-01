import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { Repository } from 'typeorm';
import { GuestUser } from './entity/guestUser.entity';
import { GuestUserDto } from './dto/guest-user.dto';

@Injectable()
export class GuestUserService {
  constructor(
    private sharedUserService: SharedUserService,
    @InjectRepository(GuestUser)
    private guestUserRepository: Repository<GuestUser>,
  ) {}

  async getAllGuests(user: CoreUserDto): Promise<GuestUserDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const guestEntities = await this.guestUserRepository.find({
        where: { host: activeCoreUser },
      });

      const guestUserDtos: GuestUserDto[] = guestEntities.map((guest) => {
        return {
          guestmail: guest.guest_email,
          hostmail: activeCoreUser.user_email,
        };
      });
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
}
