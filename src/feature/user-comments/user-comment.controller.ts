import { Body, Controller, Get, Post } from '@nestjs/common';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import { UserCommentReqDto, UserCommentResDto } from './dto/user-comment.dto';
import { UserCommentService } from './user-comment.service';

@Controller('user-comment')
export class UserCommentController {
  constructor(private userCommentService: UserCommentService) {}

  @Get()
  async getAllUserComments(
    @User() user: CoreUserDto,
  ): Promise<UserCommentResDto[]> {
    return await this.userCommentService.getAllUserComments(user);
  }

  @Post()
  async createUserComment(
    @User() user: CoreUserDto,
    @Body() userCommentDto: UserCommentReqDto,
  ): Promise<UserCommentResDto> {
    return this.userCommentService.createUserComment(user, userCommentDto);
  }
}
