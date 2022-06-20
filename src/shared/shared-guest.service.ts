import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { GuestUser } from '../feature/guest-user/entity/guestUser.entity';

@Injectable()
export class SharedGuestService {
  constructor(
    @InjectRepository(GuestUser)
    private guestUserRepository: Repository<GuestUser>,
  ) {}

  async checkForExistingGuest(guest: CoreUser) {
    const existingGuest = await this.guestUserRepository.findOne({
      where: { guest_email: guest.user_email },
      relations: ['hosts'],
    });

    return existingGuest;
  }

  async findGuestByMail(guestMail: string, relations = []) {
    return await this.guestUserRepository.findOne({
      where: { guest_email: guestMail },
      relations: relations,
    });
  }

  async addGuest(inviter: CoreUser, guest: CoreUser) {
    const guestUserObject = this.guestUserRepository.create({
      core_user_id: guest.id,
      hosts: [inviter],
      guest_email: guest.user_email,
    });

    return await this.guestUserRepository.save(guestUserObject);
  }

  async updateGuest(inviter: CoreUser, guest: GuestUser) {
    guest.hosts = [...guest.hosts, inviter];
    const updatedGuest = await this.guestUserRepository.save(guest);
    return updatedGuest;
  }

  async deleteGuest(guestId: number) {
    return (
      (await (await this.guestUserRepository.delete(guestId)).affected) > 0
    );
  }
}
