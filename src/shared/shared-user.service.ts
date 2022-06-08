import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonalAreaResDto } from '../feature/personal-areas/dto/personal-area.dto';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';

@Injectable()
export class SharedUserService {
  constructor(
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async findAll(): Promise<CoreUser[]> {
    return await this.userRepository.find();
  }

  async findByEmail(
    email: string,
    relations: string[] = [],
  ): Promise<CoreUser> {
    return await this.userRepository.findOne(
      { user_email: email },
      { relations },
    );
  }

  async findById(id: number, relations: string[] = []): Promise<CoreUser> {
    return await this.userRepository.findOne({ id: id }, { relations });
  }

  async findGuestsByHost(currentUser: CoreUser) {
    const userWithGuests = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: ['guests'],
    });

    const guestCoreUsers = await Promise.all(
      userWithGuests.guests.map(async (guest) => {
        return await this.userRepository.findOne({
          where: { id: guest.core_user_id },
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

    const areaDtos = rawData.map((rawUser) => {
      const areaDto = {
        id: rawUser.personalArea_id,
        title: rawUser.personalArea_title,
        isOwner: rawUser.personalArea_ownerId === currentUser.id,
      };
      return areaDto;
    });
    if (areaDtos[0].id) {
      return areaDtos as PersonalAreaResDto[];
    } else {
      return [] as PersonalAreaResDto[];
    }
  }

  async removeGuest(currentUser: CoreUser, guestId: number) {
    currentUser.guests = currentUser.guests.filter((guest) => {
      return guest.core_user_id !== guestId;
    });
    return await this.userRepository.save(currentUser);
  }
}
