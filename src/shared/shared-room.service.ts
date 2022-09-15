import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindOptionsRelations } from 'typeorm';
import { CoreUser } from '../core/user/entity/user.entity';
import { PersonalRoom } from '../feature/personal-room/entity/personalRoom.entity';
import { PersonalArea } from 'src/feature/personal-areas/entity/personalArea.entity';

@Injectable()
export class SharedRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
  ) {}

  async findAllOwned(
    currentUserId: number,
    relations: FindOptionsRelations<PersonalRoom> = {},
  ): Promise<PersonalRoom[]> {
    return await this.personalRoomRepository.find({
      where: { user: { id: currentUserId } },
      relations,
      order: { title: 'ASC' },
    });
  }

  async findRoomsForSharedAreas(
    sharedAreas: PersonalArea[],
  ): Promise<PersonalRoom[]> {
    if (!sharedAreas.length) return [];
    const sharedAreaids = sharedAreas.map((area) => area.id);
    return await this.personalRoomRepository
      .createQueryBuilder('personalRoom')
      .select(['personalRoom.iconId', 'personalRoom.title', 'personalRoom.id'])
      .leftJoinAndSelect('personalRoom.personalArea', 'personalArea')
      .leftJoinAndSelect('personalRoom.userImages', 'userImages')
      .where('personalArea.id IN (:...ids)', {
        ids: [...sharedAreaids],
      })
      .orderBy('personalRoom.title', 'ASC')
      .getMany();
  }

  async findWhere<T>(
    where: FindOptionsWhere<T>[] | FindOptionsWhere<T>,
    relations = [],
  ): Promise<PersonalRoom[]> {
    return await this.personalRoomRepository.find({
      where,
      relations,
    });
  }

  async findOwnedByIds(
    currentUser: CoreUser,
    ids: number[],
  ): Promise<PersonalRoom[]> {
    if (!ids.length) {
      return [];
    }

    return await this.personalRoomRepository
      .createQueryBuilder('personalRoom')
      .select(['personalRoom.iconId', 'personalRoom.title', 'personalRoom.id'])
      .leftJoinAndSelect('personalRoom.user', 'user')
      .leftJoinAndSelect('personalRoom.personalArea', 'personalArea')
      .leftJoinAndSelect('personalRoom.userImages', 'userImages')
      .where('personalRoom.user.id = :userId', { userId: currentUser.id })
      .andWhere('personalRoom.id IN (:...ids)', {
        ids: [...ids],
      })
      .getMany();
  }

  async findAnyByIds(ids: number[]): Promise<PersonalRoom[]> {
    if (!ids.length) {
      return [];
    }

    return await this.personalRoomRepository
      .createQueryBuilder('personalRoom')
      .select(['personalRoom.iconId', 'personalRoom.title', 'personalRoom.id'])
      .leftJoinAndSelect('personalRoom.user', 'user')
      .leftJoinAndSelect('personalRoom.personalArea', 'personalArea')
      .leftJoinAndSelect('personalRoom.userImages', 'userImages')
      .where('personalRoom.id IN (:...ids)', {
        ids: [...ids],
      })
      .getMany();
  }

  async deleteRooms(personalRooms: PersonalRoom[]) {
    if (personalRooms.length) {
      const cleanedPersonalRooms = personalRooms.map((personalRoom) => {
        personalRoom.personalArea = undefined;
        personalRoom.userComments = [];
        personalRoom.userImages = [];
        personalRoom.userTags = [];
        return personalRoom;
      });
      const savedPersonalRooms = await this.personalRoomRepository.save(
        cleanedPersonalRooms,
      );
      return await this.personalRoomRepository.remove(savedPersonalRooms);
    } else {
      return [];
    }
  }
}
