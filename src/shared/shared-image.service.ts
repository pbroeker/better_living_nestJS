import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CoreUser } from '../core/users/entity/user.entity';
import { UserImage } from '../feature/user-image/entity/user-image.entity';
import { createIdFindOptions } from '../utils/features/helpers';
import sizeOf from 'image-size';
import { HttpService } from '@nestjs/axios';
@Injectable()
export class SharedImageService {
  constructor(
    @InjectRepository(UserImage)
    private userImageRepository: Repository<UserImage>,
    private readonly httpService: HttpService,
  ) {}

  async findOwnedByIds(
    currentUser: CoreUser,
    ids: number[],
  ): Promise<UserImage[]> {
    if (!ids.length) {
      return [];
    }
    const findIdOptions = createIdFindOptions(ids).map((idObject) => {
      return { ...idObject, user: currentUser };
    });

    return await this.userImageRepository.find({ where: findIdOptions });
  }

  async findAllOwned(
    currentUser: CoreUser,
    relations: string[] = [],
  ): Promise<UserImage[]> {
    return await this.userImageRepository.find({
      where: { user: currentUser },
      relations: relations,
    });
  }

  async findAllRoomImages(roomId: number): Promise<UserImage[]> {
    const foundImages = await this.userImageRepository.find({
      where: {
        personalRooms: { id: roomId },
      },
      order: { createdAt: 'DESC' },
      relations: {
        personalRooms: true,
        user: true,
        userTags: true,
        userComments: { user: true, personalRoom: true },
      },
    });
    return foundImages;
  }

  async removeRoomsFromImages(user: CoreUser, roomIds: number[]) {
    const userImages = await this.findAllOwned(user, ['personalRooms']);
    const updatedGuestImages = userImages.map((guestImage) => {
      guestImage.personalRooms = guestImage.personalRooms.filter(
        (personalRoom) => !roomIds.includes(personalRoom.id),
      );
      return guestImage;
    });

    await this.userImageRepository.save(updatedGuestImages);
    return updatedGuestImages;
  }

  async checkAndAddImageDimensions(imageIds: number[]) {
    const imageEntities = await this.userImageRepository.find({
      where: { id: In(imageIds), width: null, height: null },
    });

    if (imageEntities) {
      const newImageEntites = await Promise.all(
        imageEntities.map(async (image) => {
          let width;
          let height;
          try {
            const imageData = await this.httpService.axiosRef.get(image.src, {
              responseType: 'arraybuffer',
            });
            width = sizeOf(Buffer.from(imageData.data, 'base64')).width;
            height = sizeOf(Buffer.from(imageData.data, 'base64')).height;
          } catch (error) {
            width = null;
            height = null;
          }

          return {
            ...image,
            width: width,
            height: height,
          };
        }),
      );
      this.userImageRepository.save(newImageEntites);
    }
  }

  async getImageDimensions(src: string) {
    const imageData = await this.httpService.axiosRef.get(src, {
      responseType: 'arraybuffer',
    });
    const width = sizeOf(Buffer.from(imageData.data, 'base64')).width;
    const height = sizeOf(Buffer.from(imageData.data, 'base64')).height;
    return { width, height };
  }

  async findAnyByIds(ids: number[]): Promise<UserImage[]> {
    if (!ids.length) {
      return [];
    }

    return await this.userImageRepository.find({ where: { id: In(ids) } });
  }
}
