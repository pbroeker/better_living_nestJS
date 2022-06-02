import { Controller, Get, HttpStatus, StreamableFile } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipAuth } from '../../utils/customDecorators/skipAuth.decorator';
import { ApplinksService } from './app-links.service';
import { DeviceType } from './types';

@ApiTags('app-links')
@ApiResponse({
  status: HttpStatus.OK,
  description: 'App links file returned',
})
@ApiResponse({
  status: HttpStatus.BAD_REQUEST,
  description: 'App link file does not exist',
})
@SkipAuth()
@Controller('app-links')
export class ApplinksController {
  constructor(private applinksService: ApplinksService) {}

  @Get('.well-known/apple-app-site-association')
  async getAppleAssociationLinkFile(): Promise<StreamableFile> {
    return await this.applinksService.getAppLink(DeviceType.IOS);
  }

  @Get('.well-known/assetlinks.json')
  async getAndroidLinkFile(): Promise<StreamableFile> {
    return await this.applinksService.getAppLink(DeviceType.ANDROID);
  }
}
