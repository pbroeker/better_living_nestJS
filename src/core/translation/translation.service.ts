import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as path from 'path';
import { catchError, lastValueFrom, map, of, switchMap } from 'rxjs';
import { URLSearchParams } from 'url';

interface BitbucketTokenResponse {
  scopes: string;
  access_token: string;
  expires_in: number;
  token_type: string;
  state: string;
  refresh_token: string;
}

@Injectable()
export class TranslationService {
  private readonly bitBucketAuthApi =
    'https://bitbucket.org/site/oauth2/access_token';
  private readonly bitBucketRepoApi =
    'https://api.bitbucket.org/2.0/repositories/mswag/siegenia-translations/src/master';
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}
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
          options: 1,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async downloadTranslationFiles() {
    const enJSON = await lastValueFrom(this.downloadTranslationFile('en'));
    const deJSON = await lastValueFrom(this.downloadTranslationFile('de'));
    await this.createFile('en', enJSON);
    await this.createFile('de', deJSON);
  }

  private async createFile(locale: 'en' | 'de', content: any) {
    const filePath = path.resolve(__dirname, `../../i18n/${locale}.json`);
    try {
      await fs.writeFile(filePath, JSON.stringify(content));
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private downloadTranslationFile(locale: 'en' | 'de') {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
    });
    return this.httpService
      .post(this.bitBucketAuthApi, params, {
        auth: {
          username: this.configService.get('CLIENT_ID'),
          password: this.configService.get('CLIENT_SECRET'),
        },
      })
      .pipe(
        map((axiosResponse) => axiosResponse.data as BitbucketTokenResponse),
        switchMap((data) => {
          return this.httpService
            .get(`${this.bitBucketRepoApi}/${locale}.json`, {
              headers: {
                Authorization: `Bearer ${data.access_token}`,
              },
            })
            .pipe(map((axiosResp) => axiosResp.data));
        }),
        catchError((error) => {
          console.log(error);
          return of(error.config.data);
        }),
      );
  }
}
