import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { GuestUser } from '../feature/user-guest/entity/guestUser.entity';

@Injectable()
export class SharedGuestService {
  constructor(
    @InjectRepository(GuestUser)
    private guestUserRepository: Repository<GuestUser>,
  ) {}

  async checkForExistingGuest(inviter: CoreUser, guest: CoreUser) {
    const existingGuest = await this.guestUserRepository.findOne({
      where: { guest_email: guest.user_email, host: inviter },
    });

    return existingGuest ? true : false;
  }

  async addGuest(inviter: CoreUser, guest: CoreUser) {
    const guestUserObject = this.guestUserRepository.create({
      host: inviter,
      guest_email: guest.user_email,
    });

    return await this.guestUserRepository.save(guestUserObject);
  }
}
