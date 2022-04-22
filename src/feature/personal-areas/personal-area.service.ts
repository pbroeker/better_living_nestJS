import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { Repository } from 'typeorm';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalArea } from './entity/personalArea.entity';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedRoomService } from 'src/shared/shared-room.service';
import * as _ from 'lodash';
import { PersonalRoom } from '../personal-room/entity/personalRoom.entity';
import { removeUser, removeDateStrings } from '../../utils/features/helpers';
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

      const areaEntities = (
        await this.personalAreaRepository.find({
          where: { user: activeCoreUser },
        })
      ).map((areaEntity) => {
        const areaWithoutDates = removeUser(removeDateStrings(areaEntity));
        return { ...areaWithoutDates, personalRooms: [] };
      });

      const personalRoomEntities = await this.sharedRoomService.findAll(
        activeCoreUser,
        ['personalArea'],
      );

      const personalAreas = personalRoomEntities.reduce<PersonalAreaResDto[]>(
        this.reduceRoomToAreas,
        areaEntities,
      );
      return personalAreas;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_areas.error.get_all.title',
          text: 'personal_areas.error.get_all.message',
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

      const roomEntities = await this.sharedRoomService.findByIds(
        activeCoreUser,
        personalAreaReqDto.personalRoomIds,
      );

      let newAreaEntity: PersonalArea;
      if (personalAreaReqDto.title) {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: personalAreaReqDto.title,
          personalRooms: roomEntities,
        });
      } else {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: 'Unassigned',
          personalRooms: roomEntities,
        });
      }
      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        newAreaEntity,
      );
      const areaEntityNoUser = removeUser(savedPersonalAreaEntity);

      return areaEntityNoUser;
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
        personalAreaReqDto.personalRoomIds,
      );

      personalAreaEntity.personalRooms = roomsToAdd;
      personalAreaEntity.title = personalAreaReqDto.title;

      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        personalAreaEntity,
      );
      const areaEntityNoUser = removeUser(savedPersonalAreaEntity);

      return areaEntityNoUser;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_areas.error.edit_personal_area.title',
          text: 'personal_areas.error.edit_personal_area.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private reduceRoomToAreas(
    areaObject: PersonalAreaResDto[],
    currentRoom: PersonalRoom,
  ) {
    const index = areaObject.findIndex((object) => {
      return object.id === currentRoom.personalArea.id;
    });
    const currentRoomNoUser = removeUser(removeDateStrings(currentRoom));
    const { personalArea, ...currentRoomDto } = currentRoomNoUser;
    areaObject[index].personalRooms.push(currentRoomDto);
    return areaObject;
  }
}
