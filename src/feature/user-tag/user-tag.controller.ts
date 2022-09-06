import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  RoomImageCombination,
  UserTagReqDto,
  UserTagResDto,
} from './dto/user-tag.dto';
import { UserTagService } from './user-tag.service';

@ApiBearerAuth()
@ApiTags('user-Tag')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('user-tag')
export class UserTagsController {
  constructor(private userTagService: UserTagService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning all user tags',
    type: [UserTagResDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User tags could not be loaded',
  })
  @Get()
  async getAllTags(@User() user: CoreUserDto): Promise<UserTagResDto[]> {
    return await this.userTagService.getAllTags(user);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User tag created',
    type: [UserTagResDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User tag could not be created',
  })
  @Post()
  async createUserTag(
    @User() user: CoreUserDto,
    @Body() userTagDto: UserTagReqDto,
  ): Promise<UserTagResDto> {
    return await this.userTagService.createTag(user, userTagDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag deleted',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Tag could not be deleted',
  })
  @Delete('/:tagId')
  async deleteTag(
    @User() user: CoreUserDto,
    @Param('tagId', ParseIntPipe) tagId: number,
  ): Promise<boolean> {
    return await this.userTagService.deleteTag(user, tagId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Removed tag from image/room',
    type: Boolean,
  })
  @Patch('/remove/:tagId')
  async removeTag(
    @User() user: CoreUserDto,
    @Param('tagId', ParseIntPipe) tagId: number,
    @Body() roomImageCombination: RoomImageCombination,
  ): Promise<boolean> {
    return await this.userTagService.removeTag(
      user,
      tagId,
      roomImageCombination,
    );
  }
}
