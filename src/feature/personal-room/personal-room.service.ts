import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { PersonalRoomDto } from './dto/personal-room.dto';
import { SharedUserService } from '../../shared/shared-user.service';
@Injectable()
export class PersonalRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
    private sharedUserService: SharedUserService,
  ) {}

  async getAllRooms(user: CoreUserDto): Promise<PersonalRoomDto[]> {
    try {
      const userEntity = await this.sharedUserService.findByEmail(user.email, [
        'personalRooms',
      ]);

      const personalRoomDtos = userEntity.personalRooms.map((entity) => {
        return { title: entity.title, id: entity.id };
      });
      return personalRoomDtos as PersonalRoomDto[];
    } catch (error) {
      return [];
    }
  }

  async savePersonalRooms(
    personalRoomDtos: PersonalRoomDto[],
    user: CoreUserDto,
  ): Promise<PersonalRoomDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );
      let savedPersonalRoomDtos = [];
      const personalRoomEntities = personalRoomDtos.map((personalRoom) => {
        return this.personalRoomRepository.create({
          user: activeCoreUser,
          title: personalRoom.title,
        });
      });

      const savedPersonalRoomEntities = await this.personalRoomRepository.save(
        personalRoomEntities,
      );
      savedPersonalRoomDtos = savedPersonalRoomEntities.map(
        (personalRoomEntitiy) => {
          return {
            title: personalRoomEntitiy.title,
            id: personalRoomEntitiy.id,
          } as PersonalRoomDto;
        },
      );
      return savedPersonalRoomDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.create_personal_room.title',
          text: 'personal_rooms.error.create_personal_room.message',
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
      const userEntity = await this.sharedUserService.findByEmail(user.email, [
        'personalRooms',
      ]);
      const foundRoom = userEntity.personalRooms.find((room) => {
        return room.id === roomId;
      });

      if (foundRoom) {
        const savedPersonalRoomEntity = await this.personalRoomRepository.save({
          ...foundRoom,
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
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.edit_personal_room.title',
          text: 'personal_rooms.error.edit_personal_room.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteRoom(
    user: CoreUserDto,
    roomId: number,
  ): Promise<PersonalRoomDto> {
    try {
      const userEntity = await this.sharedUserService.findByEmail(user.email, [
        'personalRooms',
      ]);
      const foundRoom = userEntity.personalRooms.find((room) => {
        return room.id === roomId;
      });
      await this.personalRoomRepository.delete(foundRoom.id);
      return {
        title: foundRoom.title,
        id: foundRoom.id,
      } as PersonalRoomDto;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.delete_personal_room.title',
          text: 'personal_rooms.error.delete_personal_room.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
