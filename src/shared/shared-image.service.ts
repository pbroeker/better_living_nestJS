import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { UserImage } from 'src/feature/user-image/entity/user-image.entity';
import { PersonalRoom } from 'src/feature/personal-room/entity/personalRoom.entity';

@Injectable()
export class SharedImageService {
  constructor(
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
  ) {}

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
