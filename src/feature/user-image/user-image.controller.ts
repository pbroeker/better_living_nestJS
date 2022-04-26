import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  EditImageRoomDto,
  PaginatedImagesResDto,
  UserImageDto,
} from './dto/user-image.dto';
import { UserImageService } from './user-image.service';

@ApiBearerAuth()
@ApiTags('user-images')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('user-image')
export class UserImageController {
  constructor(private imageService: UserImageService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning all user images',
  })
  @Get('/all')
  async getImages(@User() user: CoreUserDto): Promise<UserImageDto[]> {
    return await this.imageService.getUserImages(user);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning paginated user images',
  })
  @Get('/:page')
  async getImagesCount(
    @User() user: CoreUserDto,
    @Param('page', ParseIntPipe) page: number,
  ): Promise<PaginatedImagesResDto> {
    return await this.imageService.getUserImagesCount(user, page);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upload user image',
  })
  @Post('/upload')
  async uploadImage(
    @User() user: CoreUserDto,
    @Req() request: Express.Request,
    @Res() response: Express.Response,
  ) {
    await this.imageService.imageUpload(request, response, user);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Edited room relations',
  })
  @Patch('/:imageId/edit-rooms')
  async editRoomRelations(
    @User() user: CoreUserDto,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() editImage: EditImageRoomDto,
  ): Promise<UserImageDto> {
    return await this.imageService.editRoomRelations(user, imageId, editImage);
  }
}
