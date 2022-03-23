import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';

@Injectable()
export class PersonalRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
  ) {}

  async createPersonalRoom(title: string): Promise<PersonalRoom> {
    try {
      const personalRoomEntity = this.personalRoomRepository.create({
        title: title,
      });
      return await this.personalRoomRepository.save(personalRoomEntity);
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.create_personal_room.title',
          text: 'personal_rooms.error.create_personal_room.message',
          options: 2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
