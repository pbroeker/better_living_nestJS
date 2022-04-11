import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { PersonalArea } from '../personal-areas/entity/personalArea.entity';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { PersonalRoomDto } from './dto/personal-room.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { personalRoomEntityToDto } from 'src/utils/features/roomFunctions';
@Injectable()
export class PersonalRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
    @InjectRepository(PersonalArea)
    private personalAreaRepository: Repository<PersonalArea>,
    private sharedUserService: SharedUserService,
  ) {}

  async getAllRooms(user: CoreUserDto): Promise<PersonalRoomDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );
      const personalRoomEntities = await this.personalRoomRepository.find({
        where: { user: activeCoreUser },
        relations: ['personalArea'],
      });
      const personalRoomDtos = personalRoomEntities.map((personalRoom) => {
        const { user, personalArea, ...personalRoomNoUser } = personalRoom;
        return {
          ...personalRoomNoUser,
          personalAreaId: personalRoom.personalArea.id,
        };
      });
      return personalRoomDtos as PersonalRoomDto[];
    } catch (error) {
      throw new HttpException(
        {
          title: 'Rooms could not be loaded',
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPersonalRooms(
    personalRoomDtos: PersonalRoomDto[],
    coreUserDto: CoreUserDto,
  ): Promise<PersonalRoomDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const personalUnassignedArea = await this.personalAreaRepository.findOne({
        where: { user: activeCoreUser, title: 'Unassigned' },
      });

      let newPersonalRoomEntities: PersonalRoom[];
      if (personalUnassignedArea) {
        newPersonalRoomEntities = personalRoomDtos.map((personalRoom) => {
          return this.personalRoomRepository.create({
            user: activeCoreUser,
            title: personalRoom.title,
            personalArea: personalUnassignedArea,
          });
        });
      } else {
        const newPersonalArea = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: 'Unassigned',
        });
        newPersonalRoomEntities = personalRoomDtos.map((personalRoom) => {
          return this.personalRoomRepository.create({
            user: activeCoreUser,
            title: personalRoom.title,
            personalArea: newPersonalArea,
          });
        });
      }
      const savedPersonalRoomEntities = await this.personalRoomRepository.save(
        newPersonalRoomEntities,
      );

      const newUnassignedArea = await this.personalAreaRepository.findOne({
        where: { user: activeCoreUser, title: 'Unassigned' },
      });

      return personalRoomEntityToDto(
        savedPersonalRoomEntities,
        newUnassignedArea.id,
      );
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
