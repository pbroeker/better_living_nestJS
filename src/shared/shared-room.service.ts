import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { PersonalRoom } from '../feature/personal-room/entity/personalRoom.entity';
import { createIdFindOptions } from '../utils/features/areaFunctions';

@Injectable()
export class SharedRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
  ) {}

  async findAll(currentUser: CoreUser): Promise<PersonalRoom[]> {
    return await this.personalRoomRepository.find({
      where: { user: currentUser },
    });
  }

  async findByIds(
    currentUser: CoreUser,
    ids: number[],
  ): Promise<PersonalRoom[]> {
    const findIdOptions = createIdFindOptions(ids);

    return await this.personalRoomRepository.find({
      where: [{ user: currentUser }, ...findIdOptions],
    });
  }
}
