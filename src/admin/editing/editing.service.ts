import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminAccessDto } from './dto/password.dto';
import { SharedTagService } from 'src/shared/shared-tag.service';

@Injectable()
export class AdminEditingService {
  constructor(private sharedTagService: SharedTagService) {}

  async addRoomsToTags(adminAccessDto: AdminAccessDto): Promise<boolean> {
    try {
      if (adminAccessDto.password === 'mswag_siegenia_14916') {
        const tagEntities = await this.sharedTagService.findAll();

        const editedTagEntites = await Promise.all(
          tagEntities.map(async (tagEntity) => {
            if (!tagEntity.personalRooms.length) {
              const roomsFromUserImages = tagEntity.userImages.flatMap(
                (userImage) => userImage.personalRooms,
              );
              tagEntity.personalRooms = roomsFromUserImages;

              // // console.log('tagEntity: ', tagEntity);
              // console.log('roomsFromUserImages: ', roomsFromUserImages);
              return tagEntity;
              //   return this.personalRoomRepository.create({
              //     user: activeCoreUser,
              //     title: personalRoomDto.title,
              //     personalArea: personalArea,
              //     iconId: personalRoomDto.iconId,
              //   });
              // } else {
              //   return this.personalRoomRepository.create({
              //     user: activeCoreUser,
              //     title: personalRoomDto.title,
              //     personalArea: defaultArea,
              //     iconId: personalRoomDto.iconId,
              //   });
            } else {
              return tagEntity;
            }
          }),
        );
        return editedTagEntites as any;
      } else {
        throw new HttpException(
          {
            title: 'admin-access.wrong_password.internal.error',
            text: 'admin-access.wrong_password.internal.message',
          },
          HttpStatus.FORBIDDEN,
        );
      }
    } catch (error) {
      throw new HttpException(
        {
          title: error.response?.title
            ? error.response.title
            : 'admin-access.error.internal.title',
          text: error.response?.text
            ? error.response.text
            : 'admin-access.error.internal.message',
        },
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
