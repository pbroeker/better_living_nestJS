import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class TranslationService {
  async getLanguageJson(language: 'en' | 'de'): Promise<JSON> {
    try {
      const filePath = path.resolve(__dirname, `../../i18n/${language}.json`);
      const rawData = await fs.readFile(filePath, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      throw new HttpException(
        {
          title: 'translation.error.locale_error.title',
          text: 'translation.error.locale_error.message',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
