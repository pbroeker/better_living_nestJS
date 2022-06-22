import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository, FindOptionsRelations } from 'typeorm';
import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';
import { CoreUser } from '../core/users/entity/user.entity';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SharedUserService {
  constructor(
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<CoreUser[]> {
    return await this.userRepository.find();
  }

  async findByEmail(
    email: string,
    relations?: FindOptionsRelations<CoreUser> | string[],
  ): Promise<CoreUser> {
    return await this.userRepository.findOne({
      where: { user_email: email },
      relations: relations,
    });
  }

  async findById(
    id: number,
    relations?: FindOptionsRelations<CoreUser> | string[],
  ): Promise<CoreUser> {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: relations,
    });
  }

  async findGuestsByHost(currentUser: CoreUser) {
    const userWithGuests = await this.userRepository.findOne({
      where: { id: currentUser.id },
      relations: { guests: true },
    });

    return userWithGuests.guests;
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

  async setCurrentRefreshToken(userId: number, newRefreshToken: string) {
    const salt = parseInt(this.configService.get<string>('BCRYPT_SALT'));
    const newHashedRefreshToken = await bcrypt.hash(newRefreshToken, salt);
    await this.userRepository.update(userId, {
      currentHashedRefreshToken: newHashedRefreshToken,
    });
  }

  async removeRefreshToken(userId: number): Promise<boolean> {
    const updateResult = await this.userRepository.update(
      {
        id: userId,
        currentHashedRefreshToken: Not(IsNull()),
      },
      { currentHashedRefreshToken: null },
    );

    return updateResult.affected > 0;
  }

  async addGuest(hostUser: CoreUser, guestUser: CoreUser) {
    hostUser.guests = [...hostUser.guests, guestUser];
    await this.userRepository.save(hostUser);

    const newGuest = await this.userRepository.findOne({
      where: { id: guestUser.id },
      relations: { hosts: true, guests: true },
    });

    return newGuest;
  }

  async removeGuest(currentUser: CoreUser, guestId: number) {
    currentUser.guests = currentUser.guests.filter((guest) => {
      return guest.id !== guestId;
    });
    return await this.userRepository.save(currentUser);
  }
}
