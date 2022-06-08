import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';

@Injectable()
export class SharedUserService {
  constructor(
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async findAll(): Promise<CoreUser[]> {
    return await this.userRepository.find();
  }

  async findByEmail(email: string, relations?: string[]): Promise<CoreUser> {
    if (!relations) {
      return await this.userRepository.findOne({ user_email: email });
    } else {
      return await this.userRepository.findOne(
        { user_email: email },
        { relations },
      );
    }
  }

  async findGuestsByHost(currentUser: CoreUser) {
    const userWithGuests = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: ['guests'],
    });

    const guestCoreUsers = Promise.all(
      userWithGuests.guests.map(async (guest) => {
        return await this.userRepository.findOne({
          where: { host: guest.host },
        });
      }),
    );
    return guestCoreUsers;
  }

  // Typeorm only returns the correct and complete relations when using "getRawData()"
  // Therefore the neccessary creation and return of a new object
  async findSharedPersonalAreas(currentUser: CoreUser) {
    const rawData = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.personalAreas', 'personalArea')
      .where('user.id = :currentUserId', {
        currentUserId: currentUser.id,
      })
      .getRawMany();

    const areas = await Promise.all(
      rawData.map(async (rawUser) => {
        const owner = await this.userRepository.findOne({
          where: { id: rawUser.personalArea_ownerId },
        });

        const areaDto = {
          id: rawUser.personalArea_id,
          title: rawUser.personalArea_title,
          owner: owner,
        };
        return areaDto;
      }),
    );
    if (areas[0].id) {
      return areas as PersonalArea[];
    } else {
      return [] as PersonalArea[];
    }
  }
}
