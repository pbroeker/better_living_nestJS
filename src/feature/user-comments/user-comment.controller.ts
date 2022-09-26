import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/user/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import { UserCommentReqDto, UserCommentResDto } from './dto/user-comment.dto';
import { UserCommentService } from './user-comment.service';

@ApiBearerAuth()
@ApiTags('user-comments')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('user-comment')
export class UserCommentController {
  constructor(private userCommentService: UserCommentService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning all user comments',
    type: [UserCommentResDto],
  })
  @Get()
  async getAllUserComments(
    @User() user: CoreUserDto,
  ): Promise<UserCommentResDto[]> {
    return await this.userCommentService.getAllUserComments(user);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Post user comments',
    type: UserCommentResDto,
  })
  @Post()
  async createUserComment(
    @User() user: CoreUserDto,
    @Body() userCommentDto: UserCommentReqDto,
  ): Promise<UserCommentResDto> {
    return this.userCommentService.createUserComment(user, userCommentDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete user comment',
    type: Boolean,
  })
  @Delete('/:commentId')
  async deleteUserComment(
    @User() user: CoreUserDto,
    @Param('commentId', ParseIntPipe) commentId: number,
  ): Promise<boolean> {
    return this.userCommentService.deleteComment(user, commentId);
  }
}
