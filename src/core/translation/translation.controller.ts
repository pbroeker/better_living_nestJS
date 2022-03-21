import { Controller, Get, Param } from '@nestjs/common';
import { TranslationDto } from './dto/translation.dto';
import { TranslationService } from './translation.service';

@Controller('translation')
export class TranslationController {
  constructor(private translationService: TranslationService) {}

  @Get('/:language')
  async getLanguageJson(@Param('language') language: TranslationDto) {
    return this.translationService.getLanguageJson(language);
  }
}
