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
import { SharedAreaService } from '../../shared/shared-area.service';
import { removeUser, removeDateStrings } from 'src/utils/features/helpers';
import { SharedImageService } from '../../shared/shared-image.service';
import { PaginatedImagesResDto } from '../user-image/dto/user-image.dto';
import { PersonalAreaTitle } from 'src/types/enums';
@Injectable()
export class PersonalRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
    private sharedAreaService: SharedAreaService,
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
  ) {}

  async getAllRooms(
    user: CoreUserDto,
    imageCount?: number,
  ): Promise<PersonalRoomResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const personalRoomEntities = await this.personalRoomRepository.find({
        where: { user: activeCoreUser },
        relations: ['userImages'],
      });

      const personalRoomDtos = personalRoomEntities.map((roomEntity) => {
        const roomNoDates = removeDateStrings(roomEntity);
        const roomNoUser = removeUser(roomNoDates);
        // reducing amount of images included in room depending on queryParam
        const imagesSlices = imageCount
          ? roomNoUser.userImages.slice(0, imageCount)
          : roomNoUser.userImages;
        return {
          ...roomNoUser,
          userImages: imagesSlices,
          totalImages: roomNoUser.userImages.length,
        };
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

  async getRoomImages(
    currentUser: CoreUserDto,
    roomId: number,
    currentPage: number,
  ): Promise<PaginatedImagesResDto> {
    const imageCount = 10;
    const skip = (currentPage - 1) * imageCount;
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
      );

      const roomEntity = await this.personalRoomRepository.findOne({
        where: { user: activeCoreUser, id: roomId },
      });

      const roomImages = await this.sharedImageService.findRoomImages(
        activeCoreUser,
        roomEntity,
      );

      const userImagesNoRooms = roomImages.map((roomImage) => {
        const { personalRooms, user, ...imageNoRooms } = roomImage;
        return imageNoRooms;
      });

      // create paginationData
      const total = roomImages.length;
      const lastPage = Math.ceil(total / imageCount);
      const nextPage = currentPage + 1 > lastPage ? null : currentPage + 1;
      const prevPage = currentPage - 1 < 1 ? null : currentPage - 1;

      const paginatedImages = {
        total,
        currentPage,
        lastPage,
        nextPage,
        prevPage,
        images: userImagesNoRooms.slice(skip, imageCount),
      };

      return paginatedImages;
    } catch (error) {
      throw new HttpException(
        {
          title: 'personal_rooms.error.get_room_images.title',
          text: 'personal_rooms.error.get_room_images.message',
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
        PersonalAreaTitle.DEFAULT,
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
        const roomNoDates = removeDateStrings(newRoomEntity);
        const roomNoUser = removeUser(roomNoDates);
        const areaNoDates = removeDateStrings(roomNoUser.personalArea);
        const areaNoUser = removeUser(areaNoDates);
        return {
          ...roomNoUser,
          personalArea: areaNoUser,
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

        const roomNoDates = removeDateStrings(savedPersonalRoomEntity);
        const roomNoUser = removeUser(roomNoDates);

        return roomNoUser;
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

      const roomNoDates = removeDateStrings(personalRoomEntity);
      const roomNoUser = removeUser(roomNoDates);
      return roomNoUser;
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
