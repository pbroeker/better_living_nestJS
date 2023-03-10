import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonalRoom } from './entity/personalRoom.entity';
import { CoreUserDto } from '../../core/user/dto/core-user.dto';
import {
  PersonalRoomReqDto,
  PersonalRoomResDto,
} from './dto/personal-room.dto';
import { SharedUserService } from '../../shared/shared-user.service';
import { SharedAreaService } from '../../shared/shared-area.service';
import { SharedImageService } from '../../shared/shared-image.service';
import {
  ImageFilterQuery,
  PaginatedImagesResDto,
  UserImageDto,
} from '../user-image/dto/user-image.dto';
import { PersonalAreaTitle } from '../../types/enums';
import { PersonalArea } from '../personal-areas/entity/personalArea.entity';
import * as _ from 'lodash';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import {
  RoomImageCombination,
  UserTagResDto,
} from '../user-tag/dto/user-tag.dto';
import { SharedTagService } from 'src/shared/shared-tag.service';

@Injectable()
export class PersonalRoomService {
  constructor(
    @InjectRepository(PersonalRoom)
    private personalRoomRepository: Repository<PersonalRoom>,
    private sharedAreaService: SharedAreaService,
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
    private sharedTagService: SharedTagService,
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
          userImages: { user: true },
          userComments: {
            user: true,
          },
          personalArea: true,
          userTags: true,
        },
      });

      const personalRoomDtos: PersonalRoomResDto[] = personalRoomEntities.map(
        (roomEntity) => {
          // reducing amount of images included in room depending on queryParam
          const imagesSlices = imageCount
            ? roomEntity.userImages.slice(0, imageCount)
            : roomEntity.userImages;
          const roomDto = plainToInstance(
            PersonalRoomResDto,
            instanceToPlain(roomEntity),
            {
              excludeExtraneousValues: true,
              groups: ['withArea'],
            },
          );
          return {
            ...roomDto,
            userImages: imagesSlices.map((userImageEntity) => {
              return plainToInstance(
                UserImageDto,
                instanceToPlain(userImageEntity),
                {
                  excludeExtraneousValues: true,
                },
              );
            }),
            userTags: roomEntity.userTags.map((userTag) => {
              return plainToInstance(UserTagResDto, instanceToPlain(userTag), {
                excludeExtraneousValues: true,
              });
            }),
            totalImages: roomEntity.userImages.length,
          };
        },
      );
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
    filterObject: ImageFilterQuery = {},
  ): Promise<PaginatedImagesResDto> {
    const imageCount = 10;
    const skip = (currentPage - 1) * imageCount;
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        currentUser.email,
        { guests: true, hosts: true },
      );

      const hostIds = activeCoreUser.hosts.map((host) => host.id);
      const guestIds = activeCoreUser.hosts.map((guest) => guest.id);

      if (!filterObject.userIds || !filterObject.userIds.length) {
        filterObject.userIds = [...hostIds, ...guestIds, activeCoreUser.id];
      }

      const allRoomImages = await this.sharedImageService.findAllRoomImages(
        roomId,
      );

      const tagFilterOptions = _.uniqBy(
        allRoomImages.flatMap((roomImage) => roomImage.userTags),
        'id',
      );

      const userFilterOptions = _.uniqBy(
        allRoomImages.flatMap((roomImage) => {
          return {
            first_name: roomImage.user.first_name,
            id: roomImage.user.id,
          };
        }),
        'id',
      );

      // filterByUsers
      const userFilteredImages = allRoomImages.filter((image) => {
        return filterObject.userIds.includes(image.user.id);
      });

      // filterByTags
      const tagFilteredImages = filterObject.tagIds
        ? userFilteredImages.filter((image) => {
            return image.userTags.some((tag) =>
              filterObject.tagIds.includes(tag.id),
            );
          })
        : userFilteredImages;

      if (tagFilteredImages) {
        // create paginationData
        const total = tagFilteredImages.length;
        const lastPage = Math.ceil(total / imageCount);
        const nextPage = currentPage + 1 > lastPage ? null : currentPage + 1;
        const prevPage = currentPage - 1 < 1 ? null : currentPage - 1;
        const countedUserImageDtos = tagFilteredImages
          .slice(skip, currentPage * imageCount)
          .map((userImageEntity) => {
            const filteredTags = userImageEntity.userTags.filter((userTag) => {
              const combinationsObject = JSON.parse(
                userTag.roomImageCombinations,
              );
              return (combinationsObject as RoomImageCombination[]).some(
                (combination) => combination.roomId === roomId,
              );
            });
            const filteredComments = userImageEntity.userComments.filter(
              (userComment) => {
                return userComment.personalRoom.id === roomId;
              },
            );
            const roomEntityWithFilteredTags = {
              ...userImageEntity,
              userTags: filteredTags,
              userComments: filteredComments,
            };
            const userImageDto = plainToInstance(
              UserImageDto,
              instanceToPlain(roomEntityWithFilteredTags),
              {
                excludeExtraneousValues: true,
              },
            );
            return {
              ...userImageDto,
              isOwner: activeCoreUser.id === userImageEntity.user.id,
            };
          });
        return {
          total,
          currentPage,
          lastPage,
          nextPage,
          prevPage,
          images: countedUserImageDtos,
          filterOptions: {
            users: userFilterOptions,
            tags: tagFilterOptions.map((filterTag) => {
              return plainToInstance(
                UserTagResDto,
                instanceToPlain(filterTag),
                {
                  excludeExtraneousValues: true,
                },
              );
            }),
          },
        };
      } else {
        return {} as PaginatedImagesResDto;
      }
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
      const existingDefaultArea = await this.sharedAreaService.findByTitle(
        activeCoreUser,
        PersonalAreaTitle.DEFAULT,
      );

      let defaultArea: PersonalArea;
      if (existingDefaultArea) {
        defaultArea = existingDefaultArea;
      } else {
        const guestsOfUser = await this.sharedUserService.findGuestsByHost(
          activeCoreUser,
        );
        // Creating new unassigned area
        defaultArea = await this.sharedAreaService.createNewArea(
          activeCoreUser,
          guestsOfUser,
        );
      }

      const createdRoomEntities = await Promise.all(
        personalRoomDtos.map(async (personalRoomDto) => {
          if (personalRoomDto.areaId) {
            const personalArea = await this.sharedAreaService.findById(
              activeCoreUser,
              personalRoomDto.areaId,
            );
            return this.personalRoomRepository.create({
              user: activeCoreUser,
              title: personalRoomDto.title,
              personalArea: personalArea,
              iconId: personalRoomDto.iconId,
            });
          } else {
            return this.personalRoomRepository.create({
              user: activeCoreUser,
              title: personalRoomDto.title,
              personalArea: defaultArea,
              iconId: personalRoomDto.iconId,
            });
          }
        }),
      );

      // Saving to existing or new area
      const savedPersonalRooms = await this.personalRoomRepository.save(
        createdRoomEntities,
      );

      const newRoomDtos = savedPersonalRooms.map((newRoomEntity) => {
        return plainToInstance(
          PersonalRoomResDto,
          instanceToPlain(newRoomEntity),
          {
            excludeExtraneousValues: true,
            groups: ['withArea'],
          },
        );
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
        return plainToInstance(
          PersonalRoomResDto,
          instanceToPlain(savedPersonalRoomEntity),
          {
            excludeExtraneousValues: true,
            groups: ['withArea'],
          },
        );
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

  async deleteRoom(user: CoreUserDto, roomId: number): Promise<boolean> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const roomEntity = await this.personalRoomRepository.findOne({
        where: { id: roomId },
        relations: { userTags: { userImages: true, personalRooms: true } },
      });

      const userTags = roomEntity.userTags.map((userTag) => {
        const imagesToKeepIds: number[] = [];

        const newRoomCombinations = (
          JSON.parse(userTag.roomImageCombinations) as RoomImageCombination[]
        ).filter((combination) => {
          if (combination.roomId === roomId) {
            return false;
          } else {
            imagesToKeepIds.push(combination.imageId);
            return true;
          }
        });

        const newUserImages = userTag.userImages.filter((image) =>
          imagesToKeepIds.includes(image.id),
        );

        const newPersonalRooms = userTag.personalRooms.filter(
          (personalRoom) => personalRoom.id !== roomId,
        );
        userTag.userImages = newUserImages;
        userTag.personalRooms = newPersonalRooms;
        userTag.roomImageCombinations = JSON.stringify(newRoomCombinations);
        return userTag;
      });

      await this.sharedTagService.editTags(userTags);
      const deleteResult = await this.personalRoomRepository.delete({
        user: { id: activeCoreUser.id },
        id: roomId,
      });

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
