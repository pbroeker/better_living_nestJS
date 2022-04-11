import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { PersonalArea } from '../personal-areas/entity/personalArea.entity';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { PersonalRoomDto } from './dto/personal-room.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { personalRoomEntityToDto } from 'src/utils/features/roomFunctions';
import { flattenRoomsFromAreas } from 'src/utils/features/roomFunctions';
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

      const personalAreaEntities = await this.personalAreaRepository.find({
        where: { user: activeCoreUser },
      });

      const personalRoomDtoArray = await Promise.all(
        personalAreaEntities.map(async (personalArea) => {
          const personalRooms = await this.personalRoomRepository.find({
            where: { personalArea: personalArea },
          });
          return personalRoomEntityToDto(personalRooms, personalArea.id);
        }),
      );
      return personalRoomDtoArray.flat(1);
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

      let savedPersonalRoomEntities: PersonalRoom[];
      if (personalUnassignedArea) {
        const newPersonalRoomEntities = personalRoomDtos.map((personalRoom) => {
          return this.personalRoomRepository.create({
            title: personalRoom.title,
            personalArea: personalUnassignedArea,
          });
        });
        savedPersonalRoomEntities = await this.personalRoomRepository.save(
          newPersonalRoomEntities,
        );
      } else {
        const newPersonalRoomEntities = personalRoomDtos.map((personalRoom) => {
          return this.personalRoomRepository.create({
            title: personalRoom.title,
          });
        });
        const newPersonalArea = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: 'Unassigned',
          personalRooms: newPersonalRoomEntities,
        });
        await this.personalAreaRepository.save(newPersonalArea);
        savedPersonalRoomEntities = newPersonalRoomEntities;
      }

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
  ): Promise<PersonalRoomDto> {
    try {
      const personalRoomEntity = await this.personalRoomRepository.findOne(
        roomId,
        { relations: ['personalArea'] },
      );

      if (personalRoomEntity) {
        const savedPersonalRoomEntity = await this.personalRoomRepository.save({
          ...personalRoomEntity,
          title: newTitle,
        });

        const { personalArea, ...roomWithoutArea } = savedPersonalRoomEntity;

        return {
          ...roomWithoutArea,
          personalAreaId: personalArea.id,
        };
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

  async deleteRoom(roomId: number): Promise<PersonalRoomDto> {
    try {
      const personalRoomEntity = await this.personalRoomRepository.findOne(
        roomId,
        { relations: ['personalArea'] },
      );

      await this.personalRoomRepository.delete(personalRoomEntity.id);

      const { personalArea, ...roomWithoutArea } = personalRoomEntity;
      return {
        ...roomWithoutArea,
        personalAreaId: personalArea.id,
      };
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
