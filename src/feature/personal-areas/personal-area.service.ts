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
import { PersonalAreaTitle } from 'src/types/enums';
@Injectable()
export class PersonalAreaService {
  constructor(
    @InjectRepository(PersonalArea)
    private personalAreaRepository: Repository<PersonalArea>,
    private sharedUserService: SharedUserService,
    private sharedRoomService: SharedRoomService,
  ) {}

  async getAllAreas(
    coreUserDto: CoreUserDto,
    imageCount?: number,
  ): Promise<PersonalAreaResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const areaEntities = (
        await this.personalAreaRepository.find({
          where: { user: activeCoreUser },
        })
      ).map((areaEntity) => {
        const areaWithoutDates = removeDateStrings(areaEntity);
        const areaWithoutUser = removeUser(areaWithoutDates);
        return { ...areaWithoutUser, personalRooms: [] };
      });

      const personalRoomEntities = await this.sharedRoomService.findAll(
        activeCoreUser,
        ['personalArea', 'userImages'],
      );

      const personalAreas = personalRoomEntities.reduce<PersonalAreaResDto[]>(
        this.reduceRoomToAreas(imageCount),
        areaEntities,
      );

      // Sorting personalAreas alphabetically
      personalAreas.sort((area1, area2) => {
        return area1.title > area2.title ? 1 : -1;
      });
      // Moving Unassigned area to the end of the array
      const unassignedIndex = personalAreas.findIndex(
        (area) => area.title === PersonalAreaTitle.DEFAULT,
      );
      personalAreas.push(personalAreas.splice(unassignedIndex, 1)[0]);

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
      if (
        personalAreaReqDto.title &&
        personalAreaReqDto.title !== PersonalAreaTitle.DEFAULT
      ) {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: personalAreaReqDto.title,
          personalRooms: roomEntities,
        });
      } else {
        newAreaEntity = this.personalAreaRepository.create({
          user: activeCoreUser,
          title: PersonalAreaTitle.DEFAULT,
          personalRooms: roomEntities,
        });
      }
      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        newAreaEntity,
      );
      const areaWithoutDates = removeDateStrings(savedPersonalAreaEntity);
      const areaWithoutUser = removeUser(areaWithoutDates);

      return areaWithoutUser;
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

      // don't allow direct editing of unassigned area or creation of a new unassigned area
      if (
        personalAreaEntity.title === PersonalAreaTitle.DEFAULT ||
        personalAreaReqDto.title === PersonalAreaTitle.DEFAULT
      ) {
        throw new HttpException(
          {
            title: 'personal_areas.error.edit_unassigned.title',
            text: 'personal_areas.error.edit_unassigned.message',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

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
          where: { title: PersonalAreaTitle.DEFAULT, user: activeCoreUser },
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
      const areaWithoutDates = removeDateStrings(savedPersonalAreaEntity);
      const areaWithoutUser = removeUser(areaWithoutDates);

      return areaWithoutUser;
    } catch (error) {
      throw new HttpException(
        {
          title: error.response?.title
            ? error.response.title
            : 'personal_areas.error.edit_personal_area.title',
          text: error.response?.text
            ? error.response.text
            : 'personal_areas.error.edit_personal_area.message',
        },
        error.status,
      );
    }
  }

  async deleteArea(
    coreUserDto: CoreUserDto,
    areaId: number,
  ): Promise<PersonalAreaResDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const areaEntity = await this.personalAreaRepository.findOne({
        where: { user: activeCoreUser, id: areaId },
        relations: ['personalRooms'],
      });

      // prevent deletion of unassigned area
      if (areaEntity.title === PersonalAreaTitle.DEFAULT) {
        throw new HttpException(
          {
            title: 'personal_areas.error.delete_personal_area.title',
            text: 'personal_areas.error.delete_personal_area.message',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // move rooms of area to "Unassigned"-area
      if (areaEntity.personalRooms.length) {
        const roomsOfArea =
          await this.sharedRoomService.findWhere<PersonalRoom>({
            user: activeCoreUser,
            personalArea: areaEntity,
          });

        const unassignedArea = await this.personalAreaRepository.findOne({
          where: { user: activeCoreUser, title: PersonalAreaTitle.DEFAULT },
          relations: ['personalRooms'],
        });

        unassignedArea.personalRooms = [
          ...unassignedArea.personalRooms,
          ...roomsOfArea,
        ];

        await this.personalAreaRepository.save(unassignedArea);
      }

      await this.personalAreaRepository.delete(areaId);

      const areaWithoutDates = removeDateStrings(areaEntity);
      const areaWithoutUser = removeUser(areaWithoutDates);

      return areaWithoutUser;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_areas.error.delete_personal_area.title',
          text: 'personal_areas.error.delete_personal_area.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private reduceRoomToAreas(imageCount?: number) {
    function reducer(
      personalAreaArray: PersonalAreaResDto[],
      currentRoom: PersonalRoom,
    ) {
      // console.log('personalArea')
      const index = personalAreaArray.findIndex((object) => {
        return object.id === currentRoom.personalArea.id;
      });
      const currentRoomNoDates = removeDateStrings(currentRoom);
      const currentRoomNoUser = removeUser(currentRoomNoDates);
      const { personalArea, ...currentRoomDto } = currentRoomNoUser;
      // reducing amount of images included in room depending on queryParam
      const userImagesSlice = imageCount
        ? currentRoomNoUser.userImages.slice(0, imageCount)
        : currentRoomNoUser.userImages;

      personalAreaArray[index].personalRooms.push({
        ...currentRoomDto,
        userImages: userImagesSlice,
        totalImages: currentRoomNoUser.userImages.length,
      });
      return personalAreaArray;
    }
    return reducer;
  }
}
