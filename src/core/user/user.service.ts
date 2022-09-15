import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CoreUser } from './entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SharedAuthService } from '../../shared/shared-auth.service';
import { RegisterUserReqDto } from '../auth/dto/login-user.dto';
import { CoreUserDto } from './dto/core-user.dto';
import { SharedRoomService } from 'src/shared/shared-room.service';
import { SharedImageService } from 'src/shared/shared-image.service';
import { SharedTagService } from 'src/shared/shared-tag.service';
import { SharedAreaService } from 'src/shared/shared-area.service';
import { RoomImageCombination } from 'src/feature/user-tag/dto/user-tag.dto';
import * as _ from 'lodash';
import { SharedCommentService } from 'src/shared/shared-comment.service';
import { AmazonS3Service } from 'src/shared/aws-s3.service';
@Injectable()
export class UserService {
  constructor(
    private sharedAuthServiceService: SharedAuthService,
    private sharedRoomService: SharedRoomService,
    private sharedImageService: SharedImageService,
    private sharedTagService: SharedTagService,
    private sharedAreaService: SharedAreaService,
    private sharedCommentService: SharedCommentService,
    private awsService: AmazonS3Service,

    @InjectRepository(CoreUser)
    private userRepository: Repository<CoreUser>,
  ) {}

  async createUser(registerUserDto: RegisterUserReqDto): Promise<CoreUser> {
    const decodedPassword = Buffer.from(
      registerUserDto.password,
      'base64',
    ).toString();

    if (decodedPassword.length < 4) {
      throw new HttpException(
        {
          title: 'login.error.short_pw.title',
          text: 'login.error.short_pw.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    const pwHash = await this.sharedAuthServiceService.hashPassword(
      decodedPassword,
    );
    const userEntity = this.userRepository.create({
      ...registerUserDto,
      user_email: registerUserDto.email,
      user_password: pwHash,
    });

    const savedUserEntity = await this.userRepository.save(userEntity);
    return savedUserEntity;
  }

  async deleteUser(currentUser: CoreUserDto) {
    try {
      const activeCoreUser = await this.userRepository.findOne({
        where: { id: currentUser.userId },
        relations: {
          userTags: { personalRooms: true, userImages: true },
          personalRooms: {
            userTags: true,
            userImages: true,
            userComments: true,
            personalArea: true,
          },
          images: { userTags: { personalRooms: true, userImages: true } },
          userComment: true,
          personalAreas: { users: true },
          guests: { hosts: true },
          hosts: { guests: true },
        },
      });

      // remove user as host or guest
      // const editedHosts = activeCoreUser.hosts.map((host) => {
      //   host.guests = host.guests.filter(
      //     (guest) => guest.id !== activeCoreUser.id,
      //   );
      //   return host;
      // });
      // const editedGuests = activeCoreUser.guests.map((guest) => {
      //   guest.hosts = guest.hosts.filter(
      //     (host) => host.id !== activeCoreUser.id,
      //   );
      //   return guest;
      // });

      // delete all tagsCombinations of tags with this users rooms/images
      const userImageIds = activeCoreUser.images.map(
        (userImage) => userImage.id,
      );
      const userRoomIds = activeCoreUser.personalRooms.map(
        (userRoom) => userRoom.id,
      );

      const imageTags = activeCoreUser.images.flatMap(
        (userImage) => userImage.userTags,
      );
      const roomTags = activeCoreUser.personalRooms.flatMap(
        (userRoom) => userRoom.userTags,
      );

      const allEffectedTags = _.unionBy(imageTags, roomTags, 'id');
      const editedTags = allEffectedTags.map((userTag) => {
        if (userTag.roomImageCombinations) {
          const parsedCombinations = JSON.parse(
            userTag.roomImageCombinations,
          ) as RoomImageCombination[];
          const newRoomImageCombinations = parsedCombinations.filter(
            (combination) => {
              if (
                userImageIds.includes(combination.imageId) ||
                userRoomIds.includes(combination.roomId)
              ) {
                return false;
              } else {
                return true;
              }
            },
          );
          const stringifiedNewCombinations = JSON.stringify(
            newRoomImageCombinations,
          );
          userTag.roomImageCombinations = stringifiedNewCombinations;
        }
        if (userTag.personalRooms) {
          userTag.personalRooms = userTag.personalRooms.filter(
            (personalRoom) => !userRoomIds.includes(personalRoom.id),
          );
        }
        if (userTag.userImages) {
          userTag.userImages = userTag.userImages.filter(
            (userImage) => !userImageIds.includes(userImage.id),
          );
        }
        return userTag;
      });
      await this.sharedTagService.editTags(editedTags);

      // delete tags
      await this.sharedTagService.deleteTags(activeCoreUser.userTags);

      // delete rooms
      await this.sharedRoomService.deleteRooms(activeCoreUser.personalRooms);

      // delete images
      await this.sharedImageService.deleteImages(activeCoreUser.images);
      await this.awsService.deleteUserFolder(activeCoreUser.id);

      // delete personalArea
      await this.sharedAreaService.deleteAreas(activeCoreUser.personalAreas);

      // delete comments
      await this.sharedCommentService.deleteComments(
        activeCoreUser.userComment,
      );

      const deleteResult = await this.userRepository.remove(activeCoreUser);

      return deleteResult as CoreUser;
    } catch (error) {
      throw new HttpException(
        {
          title: 'user.error.delete_user.title',
          text: 'user.error.delete_user.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
