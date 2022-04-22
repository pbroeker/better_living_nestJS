import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import {
  PersonalRoomReqDto,
  PersonalRoomResDto,
} from './dto/personal-room.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedAreaService } from 'src/shared/shared-area.service';
import { removeUser } from 'src/utils/features/helpers';
@Injectable()
export class PersonalRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
    private sharedAreaService: SharedAreaService,
    private sharedUserService: SharedUserService,
  ) {}

  async getAllRooms(user: CoreUserDto): Promise<PersonalRoomResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const personalRoomEntities = await this.personalRoomRepository.find({
        where: { user: activeCoreUser },
      });

      const personalRoomDtos = personalRoomEntities.map((roomEntity) => {
        const roomNoUser = removeUser(roomEntity);
        return roomNoUser;
      });
      return personalRoomDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.get_personal_room.title',
          text: 'personal_rooms.error.get_personal_room.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPersonalRooms(
    personalRoomDtos: PersonalRoomReqDto[],
    coreUserDto: CoreUserDto,
  ): Promise<PersonalRoomResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      // Check if unassignedArea exists
      const existingPersonalArea = await this.sharedAreaService.findByTitle(
        activeCoreUser,
        'Unassigned',
      );

      let newPersonalRoomEntities: PersonalRoom[];
      if (existingPersonalArea) {
        // Adding to existing area
        newPersonalRoomEntities = personalRoomDtos.map((personalRoom) => {
          return this.personalRoomRepository.create({
            user: activeCoreUser,
            title: personalRoom.title,
            personalArea: existingPersonalArea,
            iconId: personalRoom.iconId,
          });
        });
      } else {
        // Creating new unassigned area
        const newPersonalArea = await this.sharedAreaService.createNewArea(
          activeCoreUser,
        );

        newPersonalRoomEntities = personalRoomDtos.map((personalRoom) => {
          return this.personalRoomRepository.create({
            user: activeCoreUser,
            title: personalRoom.title,
            iconId: personalRoom.iconId,
            personalArea: newPersonalArea,
          });
        });
      }

      // Saving to existing or new area
      const savedPersonalRooms = await this.personalRoomRepository.save(
        newPersonalRoomEntities,
      );

      const newRoomDtos = savedPersonalRooms.map((newRoomEntity) => {
        const roomWithoutUser = removeUser(newRoomEntity);
        const areaWithoutUser = removeUser(roomWithoutUser.personalArea);
        return {
          ...roomWithoutUser,
          personalArea: areaWithoutUser,
        };
      });

      return newRoomDtos;
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

  async editPersonalRoom(
    roomId: number,
    editData: PersonalRoomReqDto,
  ): Promise<PersonalRoomResDto> {
    try {
      const personalRoomEntity = await this.personalRoomRepository.findOne(
        roomId,
        { relations: ['personalArea'] },
      );

      if (personalRoomEntity) {
        const savedPersonalRoomEntity = await this.personalRoomRepository.save({
          ...personalRoomEntity,
          ...editData,
        });

        const roomWithoutUser = removeUser(savedPersonalRoomEntity);

        return roomWithoutUser;
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

  async deleteRoom(roomId: number): Promise<PersonalRoomResDto> {
    try {
      const personalRoomEntity = await this.personalRoomRepository.findOne(
        roomId,
        { relations: ['personalArea'] },
      );

      await this.personalRoomRepository.delete(personalRoomEntity.id);

      const roomWithoutUser = removeUser(personalRoomEntity);
      return roomWithoutUser;
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
