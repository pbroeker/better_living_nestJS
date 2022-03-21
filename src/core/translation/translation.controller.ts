import { Controller, Get, Query } from '@nestjs/common';
import { TranslationService } from './translation.service';

@Controller('translation')
export class TranslationController {
  constructor(private translationService: TranslationService) {}

  @Get()
  async getLanguageJson(@Query('locale') locale: string) {
    return await this.translationService.getLanguageJson(locale);
  }
}
