import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { CoreUser } from 'src/core/users/entity/user.entity';
import { PersonalArea } from '../personal-areas/entity/personalArea.entity';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { PersonalRoomDto } from './dto/personal-room.dto';
import { getUserWithQueryRunner } from 'src/utils/features/userFunctions';
import { personalRoomEntityToDto } from 'src/utils/features/roomFunctions';

@Injectable()
export class PersonalRoomService {
  constructor(
    private connection: Connection,
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
        return {
          title: entity.title,
          id: entity.id,
        };
      });
      return personalRoomDtos as PersonalRoomDto[];
    } catch (error) {
      return [];
    }
  }

  async createPersonalRooms(
    personalRoomDtos: PersonalRoomDto[],
    user: CoreUserDto,
  ): Promise<PersonalRoomDto[]> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const activeCoreUser = await getUserWithQueryRunner(queryRunner, user);

      // get unassigned personalArea to assign the new rooms to them
      const unassignedArea = await queryRunner.manager.findOne(PersonalArea, {
        where: {
          title: 'Unassigned',
          user: activeCoreUser,
        },
        relations: ['personalRooms'],
      });

      const personalRoomEntities = personalRoomDtos.map((personalRoom) => {
        return queryRunner.manager.create(PersonalRoom, {
          user: activeCoreUser,
          title: personalRoom.title,
          personalArea: unassignedArea,
        });
      });

      const savedPersonalRoomEntities = await queryRunner.manager.save(
        PersonalRoom,
        personalRoomEntities,
      );

      await queryRunner.commitTransaction();

      return personalRoomEntityToDto(
        savedPersonalRoomEntities,
        unassignedArea.id,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        {
          title: 'personal_rooms.error.create_personal_room.title',
          text: 'personal_rooms.error.create_personal_room.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async editPersonalRoomTitle(
    newTitle: string,
    roomId: number,
    user: CoreUserDto,
  ): Promise<PersonalRoomDto> {
    try {
      const userEntity = await this.userRepository.findOne({
        where: { id: user.userId },
        relations: ['personalRooms'],
      });
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
      const userEntity = await this.userRepository.findOne({
        where: { id: user.userId },
        relations: ['personalRooms'],
      });
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
