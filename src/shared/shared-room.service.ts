import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { PersonalRoom } from '../feature/personal-room/entity/personalRoom.entity';
import { createIdFindOptions } from '../utils/features/helpers';

@Injectable()
export class SharedRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
  ) {}

  async findAll(
    currentUser: CoreUser,
    relations = [],
  ): Promise<PersonalRoom[]> {
    return await this.personalRoomRepository.find({
      where: { user: currentUser },
      relations,
    });
  }

  async findWhere<T>(
    where: FindConditions<T>[] | FindConditions<T>,
    relations = [],
  ): Promise<PersonalRoom[]> {
    return await this.personalRoomRepository.find({
      where,
      relations,
    });
  }

  async findByIds(
    currentUser: CoreUser,
    ids: number[],
  ): Promise<PersonalRoom[]> {
    const findIdOptions = createIdFindOptions(ids).map((idObject) => {
      return { ...idObject, user: currentUser };
    });

    return await this.personalRoomRepository.find({
      where: findIdOptions,
    });
  }
}
