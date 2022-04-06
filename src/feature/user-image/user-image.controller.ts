import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import { UserImageSevice } from './user-image.service';

@ApiBearerAuth()
@Controller('user-image')
export class UserImageController {
  constructor(private imageService: UserImageSevice) {}

  /*   @Get('/all')
  async getImages(
    @User() user: CoreUserDto,
    @Req() request: Express.Request,
    @Res() response: Express.Response,
  ) {} */

  @Post('/upload')
  async uploadImage(
    @User() user: CoreUserDto,
    @Req() request: Express.Request,
    @Res() response: Express.Response,
  ) {
    await this.imageService.imageUpload(request, response, user);
  }
}
