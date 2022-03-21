import { Injectable } from '@nestjs/common';
import { TranslationDto } from './dto/translation.dto';
import { readFileSync } from 'fs';

@Injectable()
export class TranslationService {
  async getLanguageJson(language: TranslationDto): Promise<JSON> {
    try {
      const path = `${process.cwd()}/src/i18n/${language}.json`;
      const rawData = readFileSync(path, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      // TODO: Correct errorhandling
      console.log(` ======= ERROR ====== : ${error}`);
    }
  }
}
