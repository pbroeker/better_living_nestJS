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
import { removeUser } from '../../utils/features/helpers';
import { SharedImageService } from '../../shared/shared-image.service';
import { PaginatedImagesResDto } from '../user-image/dto/user-image.dto';
import { PersonalAreaTitle } from '../../types/enums';
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
        where: { user: { id: activeCoreUser.id } },
        relations: {
          userImages: true,
        },
      });

      const personalRoomDtos = personalRoomEntities.map((roomEntity) => {
        const roomNoUser = removeUser(roomEntity);
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
    roomId: number,
    currentPage: number,
  ): Promise<PaginatedImagesResDto> {
    const imageCount = 10;
    const skip = (currentPage - 1) * imageCount;
    try {
      const roomEntity = await this.personalRoomRepository.findOne({
        where: { id: roomId },
      });

      const roomImages = await this.sharedImageService.findRoomImages(
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
        images: userImagesNoRooms.slice(skip, skip + imageCount),
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
        const guestsOfUser = await this.sharedUserService.findGuestsByHost(
          activeCoreUser,
        );
        // Creating new unassigned area
        const newPersonalArea = await this.sharedAreaService.createNewArea(
          activeCoreUser,
          guestsOfUser,
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
        const roomNoUser = removeUser(newRoomEntity);
        const { users, owner, ...areaNoUsers } = roomNoUser.personalArea;
        return {
          ...roomNoUser,
          personalArea: areaNoUsers,
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
      const personalRoomEntity = await this.personalRoomRepository.findOne({
        where: { id: roomId },
        relations: { personalArea: true },
      });

      if (personalRoomEntity) {
        const savedPersonalRoomEntity = await this.personalRoomRepository.save({
          ...personalRoomEntity,
          ...editData,
        });
        const roomNoUser = removeUser(savedPersonalRoomEntity);

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

  async deleteRoom(roomId: number): Promise<boolean> {
    try {
      const personalRoomEntity = await this.personalRoomRepository.findOne({
        where: { id: roomId },
        relations: { personalArea: true },
      });

      const deleteResult = await this.personalRoomRepository.delete(
        personalRoomEntity.id,
      );

      return deleteResult.affected > 0;
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
