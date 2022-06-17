import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { Repository } from 'typeorm';
import {
  PersonalAreaReqDto,
  PersonalAreaResDto,
} from './dto/personal-area.dto';
import { PersonalArea } from './entity/personalArea.entity';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedRoomService } from '../../shared/shared-room.service';
import { PersonalRoom } from '../personal-room/entity/personalRoom.entity';
import { removeUser, getUserInitials } from '../../utils/features/helpers';
import { PersonalAreaTitle } from '../../types/enums';
import * as _ from 'lodash';
import { PersonalRoomResDto } from '../personal-room/dto/personal-room.dto';

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

      const areas = await this.sharedUserService.findSharedPersonalAreas(
        activeCoreUser,
      );

      const personalRoomEntities =
        await this.sharedRoomService.findRoomsForSharedAreas(areas);

      const personalAreasDtos = this.reduceRoomsToAreas(
        areas,
        personalRoomEntities,
        activeCoreUser.id,
        imageCount,
      );

      // Sorting personalAreas alphabetically
      personalAreasDtos.sort((area1, area2) => {
        return area1.title > area2.title ? -1 : 1;
      });
      // Moving Unassigned area to the end of the array
      const unassignedIndex = personalAreasDtos.findIndex(
        (area) => area.title === PersonalAreaTitle.DEFAULT,
      );
      // make sure the array is sorted only if not empty
      if (unassignedIndex !== -1) {
        personalAreasDtos.push(personalAreasDtos.splice(unassignedIndex, 1)[0]);
      }

      return personalAreasDtos;
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

      const guestsOfUser = await this.sharedUserService.findGuestsByHost(
        activeCoreUser,
      );

      const roomEntities = await this.sharedRoomService.findOwnedByIds(
        activeCoreUser,
        personalAreaReqDto.personalRoomIds,
      );

      let newAreaEntity: PersonalArea;
      if (
        personalAreaReqDto.title &&
        personalAreaReqDto.title !== PersonalAreaTitle.DEFAULT
      ) {
        newAreaEntity = this.personalAreaRepository.create({
          users: [...guestsOfUser, activeCoreUser],
          title: personalAreaReqDto.title,
          personalRooms: roomEntities,
          owner: activeCoreUser,
        });
      } else {
        throw new HttpException(
          {
            title: 'personal_areas.error.create_unassigned.title',
            text: 'personal_areas.error.create_unassigned.message',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        newAreaEntity,
      );
      const { users, owner, ...areaWithoutUsers } = savedPersonalAreaEntity;
      const areaDto: PersonalAreaResDto = {
        ...areaWithoutUsers,
        ownerInitals: getUserInitials(savedPersonalAreaEntity.owner),
        personalRooms: savedPersonalAreaEntity.personalRooms.map(
          (personalRoom) => {
            const currentRoomNoUser = removeUser(personalRoom);
            const { personalArea, ...currentRoomDto } = currentRoomNoUser;
            return currentRoomDto;
          },
        ),
        isOwner: savedPersonalAreaEntity.owner.id === activeCoreUser.id,
      };
      return areaDto;
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
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
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
        where: { owner: activeCoreUser, id: areaId },
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
        const roomsToRemove = await this.sharedRoomService.findOwnedByIds(
          activeCoreUser,
          unassignedRoomIds,
        );

        const unassignedArea = await this.personalAreaRepository.findOne({
          where: { title: PersonalAreaTitle.DEFAULT, owner: activeCoreUser },
          relations: ['personalRooms'],
        });

        unassignedArea.personalRooms = [
          ...unassignedArea.personalRooms,
          ...roomsToRemove,
        ];
        await this.personalAreaRepository.save(unassignedArea);
      }

      // update personalArea with new list of rooms
      const roomsToAdd = await this.sharedRoomService.findOwnedByIds(
        activeCoreUser,
        personalAreaReqDto.personalRoomIds,
      );

      personalAreaEntity.personalRooms = roomsToAdd;
      personalAreaEntity.title =
        personalAreaReqDto.title || personalAreaEntity.title;

      const savedPersonalAreaEntity = await this.personalAreaRepository.save(
        personalAreaEntity,
      );
      const savedPersonalAreaEntityWithOwner =
        await this.personalAreaRepository.findOne({
          where: { id: savedPersonalAreaEntity.id },
          relations: ['owner', 'personalRooms'],
        });
      const { users, ...areaWithoutUsers } = savedPersonalAreaEntityWithOwner;
      const areaDto: PersonalAreaResDto = {
        ...savedPersonalAreaEntityWithOwner,
        ownerInitals: getUserInitials(savedPersonalAreaEntityWithOwner.owner),
        personalRooms: areaWithoutUsers.personalRooms.map((personalRoom) => {
          const currentRoomNoUser = removeUser(personalRoom);
          const { personalArea, ...currentRoomDto } = currentRoomNoUser;
          return currentRoomDto;
        }),
        isOwner:
          savedPersonalAreaEntityWithOwner.owner.id === activeCoreUser.id,
      };

      return areaDto;
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
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteArea(coreUserDto: CoreUserDto, areaId: number): Promise<boolean> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        coreUserDto.email,
      );

      const areaEntity = await this.personalAreaRepository.findOne({
        where: { owner: activeCoreUser, id: areaId },
        relations: ['personalRooms', 'users'],
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
          where: { owner: activeCoreUser, title: PersonalAreaTitle.DEFAULT },
          relations: ['personalRooms'],
        });

        unassignedArea.personalRooms = [
          ...unassignedArea.personalRooms,
          ...roomsOfArea,
        ];
        await this.personalAreaRepository.save(unassignedArea);
      }
      const deletedArea = await this.personalAreaRepository.remove(areaEntity);
      return deletedArea ? true : false;
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

  private reduceRoomsToAreas(
    personalAreas: PersonalArea[],
    personalRooms: PersonalRoom[],
    currentUserId: number,
    imageCount?: number,
  ): PersonalAreaResDto[] {
    return personalAreas.reduce(
      (personalAreaArray: PersonalAreaResDto[], currentArea: PersonalArea) => {
        const newPersonalAreaDto: PersonalAreaResDto = {
          id: currentArea.id,
          title: currentArea.title,
          isOwner: currentArea.owner.id === currentUserId,
          ownerInitals: getUserInitials(currentArea.owner),
        };

        const newRoomDtos: PersonalRoomResDto[] = personalRooms
          .filter(
            (personalRoom) => personalRoom.personalArea.id === currentArea.id,
          )
          .map((personalRoom) => {
            const userImagesSlice = imageCount
              ? personalRoom.userImages.slice(0, imageCount)
              : personalRoom.userImages;

            const { personalArea, user, ...personalRoomNoArea } = personalRoom;
            return {
              ...personalRoomNoArea,
              userImages: userImagesSlice,
              totalImages: personalRoomNoArea.userImages.length,
            };
          });

        newPersonalAreaDto.personalRooms = newRoomDtos;
        personalAreaArray.push(newPersonalAreaDto);
        return personalAreaArray;
      },
      [] as PersonalAreaResDto[],
    );
  }
}
