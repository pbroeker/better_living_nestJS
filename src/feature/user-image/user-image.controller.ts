import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { SharedImageService } from '../../shared/shared-image.service';
import { User } from '../../utils/customDecorators/user.decorator';

@ApiBearerAuth()
@Controller('user-image')
export class UserImageController {
  constructor(private sharedImageService: SharedImageService) {}

  @Get('/all')
  async getImages(
    @User() user: CoreUserDto,
    @Req() request: Express.Request,
    @Res() response: Express.Response,
  ) {}

  @Post('/upload')
  async uploadImage(
    @User() user: CoreUserDto,

    @Req() request: Express.Request,
    @Res() response: Express.Response,
  ) {
    const imagePath = await this.sharedImageService.imageUpload(request, response);
  }
}
