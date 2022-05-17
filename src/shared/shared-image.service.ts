import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { UserImage } from '../feature/user-image/entity/user-image.entity';
import { PersonalRoom } from '../feature/personal-room/entity/personalRoom.entity';
import { createIdFindOptions } from '../utils/features/helpers';

@Injectable()
export class SharedImageService {
  constructor(
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
  ) {}

  async findByIds(currentUser: CoreUser, ids: number[]): Promise<UserImage[]> {
    if (!ids.length) {
      return [];
    }
    const findIdOptions = createIdFindOptions(ids).map((idObject) => {
      return { ...idObject, user: currentUser };
    });

    return await this.userImageRepository.find({ where: findIdOptions });
  }

  async findRoomImages(
    currentUser: CoreUser,
    room: PersonalRoom,
  ): Promise<UserImage[]> {
    // nestjs/typeorm just supports typeorm 0.2
    // use "ArrayContains" as soon as it supports the actual version 0.3
    const foundImages = await this.userImageRepository.find({
      relations: ['personalRooms'],
      where: { user: currentUser },
      order: { updatedAt: 'DESC' },
    });

    const filteredImages = await foundImages.filter((image) =>
      image.personalRooms.some((imageRoom) => imageRoom.id === room.id),
    );

    return filteredImages;
  }
}