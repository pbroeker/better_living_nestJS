import { Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import { UserImageDto } from './dto/user-image.dto';
import { UserImageSevice } from './user-image.service';

@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('user-image')
export class UserImageController {
  constructor(private imageService: UserImageSevice) {}

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
}
