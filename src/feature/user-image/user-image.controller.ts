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
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/user/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  EditImageDto,
  ImageFilterQuery,
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
    type: [UserImageDto],
  })
  @Get('/all')
  async getImages(@User() user: CoreUserDto): Promise<UserImageDto[]> {
    return await this.imageService.getAllImages(user);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning paginated user images',
    type: PaginatedImagesResDto,
  })
  @Get('/:page')
  async getImagesCount(
    @User() user: CoreUserDto,
    @Param('page', ParseIntPipe) page: number,
    @Query() imageFilter?: ImageFilterQuery,
  ): Promise<PaginatedImagesResDto> {
    return await this.imageService.getUserImagesCount(user, page, imageFilter);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning image details',
    type: UserImageDto,
  })
  @Get('/detail/:imageId')
  async getUserImage(
    @User() user: CoreUserDto,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Query('roomId') roomId: number | undefined,
  ): Promise<UserImageDto> {
    return await this.imageService.getUserImage(user, imageId, roomId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upload user image',
  })
  @UseInterceptors(FileInterceptor('image'))
  @Post('/upload')
  async uploadImage(
    @User() user: CoreUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.imageService.reorientImage(
      file.buffer,
      file.originalname,
      user,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Add relations to room',
    type: [UserImageDto],
  })
  @Patch()
  async updateImage(
    @User() user: CoreUserDto,
    @Body() editImageDto: EditImageDto,
  ): Promise<UserImageDto[]> {
    return await this.imageService.updateImage(user, editImageDto);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Delete User Image',
    type: Boolean,
  })
  @Delete('/:imageId')
  async deleteImage(
    @User() user: CoreUserDto,
    @Param('imageId', ParseIntPipe) imageId: number,
  ): Promise<boolean> {
    return await this.imageService.deleteImage(user, imageId);
  }
}
