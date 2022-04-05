import { Controller, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SharedImageService } from 'src/shared/shared-image.service';
import { SkipAuth } from 'src/utils/customDecorators/skipAuth.decorator';

@SkipAuth()
@Controller('user-image')
export class UserImageController {
  constructor(private sharedImageService: SharedImageService) {}

  @Post('/upload')
  async uploadImage(
    @Req() request: Express.Request,
    @Res() response: Express.Response,
  ) {
    try {
      await this.sharedImageService.imageUpload(request, response);
    } catch (error) {
      return error;
    }
  }
}
