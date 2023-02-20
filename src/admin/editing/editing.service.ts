import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AdminAccessDto } from './dto/password.dto';
import { SharedTagService } from 'src/shared/shared-tag.service';
import { RoomImageCombination } from 'src/feature/user-tag/dto/user-tag.dto';

@Injectable()
export class AdminEditingService {
  constructor(private sharedTagService: SharedTagService) {}

  async addRoomsToTags(adminAccessDto: AdminAccessDto): Promise<boolean> {
    try {
      if (adminAccessDto.password === 'mswag_betterliving_14916') {
        const tagEntities = await this.sharedTagService.findAll();

        const editedTagEntites = await Promise.all(
          tagEntities.map(async (tagEntity) => {
            // Add personalRoomRelations to tags that just have imageRelations
            if (!tagEntity.personalRooms.length) {
              const roomsFromUserImages = tagEntity.userImages.flatMap(
                (userImage) => userImage.personalRooms,
              );
              tagEntity.personalRooms = roomsFromUserImages;

              return tagEntity;
            } else {
              return tagEntity;
            }
          }),
        );

        const tagsWithCombination = editedTagEntites.map((tagEntity) => {
          const roomIds = tagEntity.personalRooms.map((room) => room.id);
          const imageIds = tagEntity.userImages.map((image) => image.id);

          const roomImageCombinations = roomIds.flatMap((roomId) =>
            imageIds.map((imageId) => {
              const combination: RoomImageCombination = {
                roomId: roomId,
                imageId: imageId,
              };
              return combination;
            }),
          );
          tagEntity.roomImageCombinations = JSON.stringify(
            roomImageCombinations,
          );
          return tagEntity;
        });

        const result = this.sharedTagService.editTags(tagsWithCombination);
        return result as any;
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
