import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { SkipAuth } from 'src/utils/customDecorators/skipAuth.decorator';
import { TranslationService } from './translation.service';
@Controller('translation')
export class TranslationController {
  constructor(private translationService: TranslationService) {}

  @SkipAuth()
  @Get()
  @ApiQuery({ name: 'locale', enum: ['en', 'de'] })
  async getLanguageJson(@Query('locale') locale: 'en' | 'de') {
    return await this.translationService.getLanguageJson(locale);
  }
}
