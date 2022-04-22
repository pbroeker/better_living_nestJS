import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { Repository } from 'typeorm';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalArea } from './entity/personalArea.entity';
import { personalRoomEntityToDto } from 'src/utils/features/roomFunctions';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedRoomService } from 'src/shared/shared-room.service';
import { flattenRoomsFromAreas } from '../../utils/features/roomFunctions';
import * as _ from 'lodash';
@Injectable()
export class PersonalAreaService {
  constructor(
    @InjectRepository(PersonalArea)
    private personalAreaRepository: Repository<PersonalArea>,
    private sharedUserService: SharedUserService,
    private sharedRoomService: SharedRoomService,
  ) {}

  async getAllAreas(coreUserDto: CoreUserDto): Promise<PersonalAreaResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const personalAreaEntities = await this.personalAreaRepository.find({
        where: { user: activeCoreUser },
        relations: ['personalRooms'],
      });

      const personalAreaDtos = personalAreaEntities.map((personalArea) => {
        const personalRoomDtos = personalRoomEntityToDto(
          personalArea.personalRooms,
          personalArea.id,
        );
        const { user, ...personalAreaNoUser } = personalArea;
        return {
          ...personalAreaNoUser,
          personalRooms: personalRoomDtos,
        };
      });
      return personalAreaDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'Personal areas could not be loaded',
          error: error,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createPersonalArea(
    personalAreaReqDto: PersonalAreaReqDto,
    coreUserDto: CoreUserDto,
  ): Promise<PersonalAreaResDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const personalAreas = await this.personalAreaRepository.find({
        where: { user: activeCoreUser },
        relations: ['personalRooms'],
      });

      const personalRooms = flattenRoomsFromAreas(personalAreas);

      const roomsToEdit = personalRooms.filter((personalRoom) =>
        personalAreaReqDto.personalRoomIds.includes(personalRoom.id),
      );

      let newAreaEntity: PersonalArea;
      if (personalAreaReqDto.title) {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: personalAreaReqDto.title,
          personalRooms: roomsToEdit,
        });
      } else {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: 'Unassigned',
          personalRooms: roomsToEdit,
        });
      }
      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        newAreaEntity,
      );
      const { user, ...areaEntityNoUser } = savedPersonalAreaEntity;

      return {
        ...areaEntityNoUser,
        personalRooms: personalRoomEntityToDto(
          roomsToEdit,
          areaEntityNoUser.id,
        ),
      } as PersonalAreaResDto;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_areas.error.create_personal_area.title',
          text: 'personal_areas.error.create_personal_area.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async editPersonalArea(
    areaId: number,
    personalAreaReqDto: PersonalAreaReqDto,
    coreUserDto: CoreUserDto,
  ): Promise<PersonalAreaResDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const personalAreaEntity = await this.personalAreaRepository.findOne({
        where: { user: activeCoreUser, id: areaId },
        relations: ['personalRooms'],
      });

      const personalAreaRoomIds = personalAreaEntity.personalRooms.map(
        (personalRoom) => personalRoom.id,
      );

      const unassignedRoomIds = _.difference(
        personalAreaRoomIds,
        personalAreaReqDto.personalRoomIds,
      );

      // move removed rooms to unassigned personalArea
      if (unassignedRoomIds.length) {
        const roomsToRemove = await this.sharedRoomService.findByIds(
          activeCoreUser,
          unassignedRoomIds,
        );

        const unassignedArea = await this.personalAreaRepository.findOne({
          where: { title: 'Unassigned', user: activeCoreUser },
          relations: ['personalRooms'],
        });

        unassignedArea.personalRooms = [
          ...unassignedArea.personalRooms,
          ...roomsToRemove,
        ];

        await this.personalAreaRepository.save(unassignedArea);
      }

      // update personalArea with new list of rooms
      const roomsToAdd = await this.sharedRoomService.findByIds(
        activeCoreUser,
        unassignedRoomIds,
      );
      personalAreaEntity.personalRooms = roomsToAdd;
      personalAreaEntity.title = personalAreaReqDto.title;

      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        personalAreaEntity,
      );
      const { user, ...areaEntityNoUser } = savedPersonalAreaEntity;

      return {
        ...areaEntityNoUser,
        personalRooms: personalRoomEntityToDto(roomsToAdd, areaEntityNoUser.id),
      } as PersonalAreaResDto;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.get_personal_area.title',
          text: 'personal_rooms.error.get_personal_area.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
