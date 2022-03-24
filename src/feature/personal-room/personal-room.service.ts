import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { CoreUser } from 'src/core/users/entity/user.entity';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { PersonalRoomDto } from './dto/personal-room.dto';
@Injectable()
export class PersonalRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async getAllRooms(user: CoreUserDto): Promise<PersonalRoomDto[]> {
    try {
      const userEntity = await this.userRepository.findOne(user.userId, {
        relations: ['personalRooms'],
      });

      const personalRoomDtos = userEntity.personalRooms.map((entity) => {
        return { title: entity.title, id: entity.id };
      });
      return personalRoomDtos as PersonalRoomDto[];
    } catch (error) {
      return [];
    }
  }

  async createPersonalRoom(
    title: string,
    user: CoreUserDto,
  ): Promise<PersonalRoomDto> {
    try {
      const activeCoreUser = await this.userRepository.findOne(user.userId);
      const personalRoomEntity = this.personalRoomRepository.create({
        user: activeCoreUser,
        title: title,
      });
      const savedPersonalRoomEntity = await this.personalRoomRepository.save(
        personalRoomEntity,
      );
      return {
        title: savedPersonalRoomEntity.title,
        id: savedPersonalRoomEntity.id,
      } as PersonalRoomDto;
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

  async editPersonalRoomTitle(
    newTitle: string,
    roomId: number,
    user: CoreUserDto,
  ): Promise<PersonalRoomDto> {
    try {
      const personalRoomEntity = await this.personalRoomRepository.findOne({
        where: { id: roomId },
        relations: ['user'],
      });
      if (personalRoomEntity && personalRoomEntity.user.id === user.userId) {
        const savedPersonalRoomEntity = await this.personalRoomRepository.save({
          ...personalRoomEntity,
          title: newTitle,
        });
        return {
          title: savedPersonalRoomEntity.title,
          id: savedPersonalRoomEntity.id,
        } as PersonalRoomDto;
      } else {
        throw new HttpException(
          {
            title: 'personal_rooms.error.edit_personal_room.title',
            text: 'personal_rooms.error.edit_personal_room.message',
            options: 2,
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.edit_personal_room.title',
          text: 'personal_rooms.error.edit_personal_room.message',
          options: 2,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
