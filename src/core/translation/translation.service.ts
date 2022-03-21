import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class TranslationService {
  async getLanguageJson(language: 'en' | 'de'): Promise<JSON> {
    try {
      const path = `${process.cwd()}/src/i18n/${language}.json`;
      const rawData = await fs.readFile(path, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      throw new HttpException(
        { title: 'error_locale', text: 'non_existent_locale', options: 1 },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
