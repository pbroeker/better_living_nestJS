import { Controller, Get, Post } from '@nestjs/common';
import { CoreUserDto } from 'src/core/users/dto/core-user.dto';
import { User } from 'src/utils/customDecorators/user.decorator';
import { UserCommentReqDto, UserCommentResDto } from './dto/user-comment.dto';
import { UserComment } from './entity/userComment.entity';
import { UserCommentService } from './user-comment.service';

@Controller('user-comment')
export class UserCommentController {
  constructor(private userCommentService: UserCommentService) {}

  @Get()
  async getAllUserComments(@User() user: CoreUserDto): Promise<UserComment[]> {
    return await this.userCommentService.getAllUserComments(user);
  }

  @Post()
  async createUserComment(
    @User() user: CoreUserDto,
    userCommentDto: UserCommentReqDto,
  ): Promise<UserComment> {
    return this.userCommentService.createUserComment(user, userCommentDto);
  }
}
