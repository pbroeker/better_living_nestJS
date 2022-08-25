import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { SharedImageService } from 'src/shared/shared-image.service';
import { SharedUserService } from 'src/shared/shared-user.service';
import { Repository } from 'typeorm';
import { UserCommentReqDto } from './dto/user-comment.dto';
import { UserComment } from './entity/userComment.entity';
import { SharedRoomService } from '../../shared/shared-room.service';

@Injectable()
export class UserCommentService {
  constructor(
    @InjectRepository(UserComment)
    private userCommentRepository: Repository<UserComment>,
    private sharedUserService: SharedUserService,
    private sharedImageService: SharedImageService,
    private sharedRoomService: SharedRoomService,
  ) {}

  async getAllUserComments(user: CoreUserDto) {
    try {
      const activeCoreUser = await this.sharedUserService.findByEmail(
        user.email,
      );
      const userComments = await this.userCommentRepository.find({
        where: { user: activeCoreUser },
      });

      return userComments as UserComment[];
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
  ) {
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

      return userComment as UserComment;
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
