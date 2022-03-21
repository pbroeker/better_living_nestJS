import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';

@Injectable()
export class TranslationService {
  async getLanguageJson(language: 'en' | 'de'): Promise<JSON> {
    try {
      const path = `${process.cwd()}/src/i18n/${language}.json`;
      const rawData = await fs.readFile(path, 'utf8');
      return JSON.parse(rawData);
    } catch (error) {
      // TODO: Correct errorhandling
      console.log(` ======= ERROR ====== : ${error}`);
    }
  }
}
