import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { SkipAuth } from '../../utils/customDecorators/skipAuth.decorator';
import { TranslationService } from './translation.service';
@Controller('translation')
export class TranslationController {
  constructor(private translationService: TranslationService) {}

  @SkipAuth()
  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Locale has been found and returned',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Locale does not exist',
  })
  @ApiQuery({ name: 'locale', enum: ['en', 'de'] })
  async getLanguageJson(@Query('locale') locale: 'en' | 'de') {
    return await this.translationService.getLanguageJson(locale);
  }

  @SkipAuth()
  @Get('/download')
  async downloadTranslationFiles() {
    return await this.translationService.downloadTranslationFiles();
  }
}
