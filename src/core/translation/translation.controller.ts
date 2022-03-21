import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TranslationService } from './translation.service';
@Controller('translation')
export class TranslationController {
  constructor(private translationService: TranslationService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Locale has been found and returned',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Locale doesn't exist",
  })
  @ApiQuery({ name: 'locale', enum: ['en', 'de'] })
  async getLanguageJson(@Query('locale') locale: 'en' | 'de') {
    return await this.translationService.getLanguageJson(locale);
  }
}
