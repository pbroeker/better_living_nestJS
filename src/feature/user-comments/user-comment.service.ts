import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedImageService } from '../../shared/shared-image.service';
import { SharedUserService } from '../../shared/shared-user.service';
import { Repository } from 'typeorm';
import { UserCommentReqDto, UserCommentResDto } from './dto/user-comment.dto';
import { UserComment } from './entity/userComment.entity';
import { SharedRoomService } from '../../shared/shared-room.service';
import { getUserInitials } from '../../utils/features/helpers';

@Injectable()
export class UserCommentService {
  constructor(
    @InjectRepository(UserComment)
    private userCommentRepository: Repository<UserComment>,
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
    private sharedRoomService: SharedRoomService,
  ) {}

  async getAllUserComments(user: CoreUserDto): Promise<UserCommentResDto[]> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );
      const userCommentEntitites = await this.userCommentRepository.find({
        where: { user: activeCoreUser },
        relations: {
          personalRoom: true,
          userImage: true,
        },
      });

      const userCommentDtos: UserCommentResDto[] = userCommentEntitites.map(
        (userComment) => {
          return {
            content: userComment.content,
            ownerInitials: getUserInitials(activeCoreUser),
            ownerName: `${activeCoreUser.first_name} ${activeCoreUser.last_name}`,
            createdAt: userComment.createdAt,
            roomId: userComment.personalRoom.id,
            imageId: userComment.userImage.id,
          };
        },
      );

      return userCommentDtos;
    } catch (error) {
      throw new HttpException(
        {
          title: 'user-comment.error.get_all_comments.title',
          text: 'user-comment.error.get_all_comments.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createUserComment(
    user: CoreUserDto,
    userCommentDto: UserCommentReqDto,
  ): Promise<UserCommentResDto> {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );

      const personalRoomEntity = await this.sharedRoomService.findAnyByIds([
        userCommentDto.roomId,
      ]);
      const userImageEntity = await this.sharedImageService.findAnyByIds([
        userCommentDto.imageId,
      ]);
      const userComment = await this.userCommentRepository.save({
        user: activeCoreUser,
        content: userCommentDto.content,
        userImage: userImageEntity[0],
        personalRoom: personalRoomEntity[0],
      });

      return {
        content: userComment.content,
        ownerInitials: getUserInitials(activeCoreUser),
        ownerName: `${activeCoreUser.first_name} ${activeCoreUser.last_name}`,
        createdAt: userComment.createdAt,
        roomId: userComment.personalRoom.id,
        imageId: userComment.userImage.id,
      };
    } catch (error) {
      throw new HttpException(
        {
          title: 'user-comment.error.get_all_comments.title',
          text: 'user-comment.error.get_all_comments.message',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
