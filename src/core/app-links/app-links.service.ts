import {
  HttpException,
  HttpStatus,
  Injectable,
  StreamableFile,
} from '@nestjs/common';
import { createReadStream } from 'fs';
import * as path from 'path';
import { DeviceType } from './types';

@Injectable()
export class ApplinksService {
  async getAppLink(type: DeviceType): Promise<StreamableFile> {
    const dirPath = path.resolve(__dirname, '../../assets/');
    let filename: string;
    if (type === DeviceType.IOS) {
      filename = 'apple-app-site-association';
    } else if (type === DeviceType.ANDROID) {
      filename = 'assetlinks.json';
    } else {
      throw new HttpException(
        {
          title: 'app_link.error.title',
          text: 'app_link.error.message',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const file = createReadStream(path.join(dirPath, filename));
    return new StreamableFile(file);
  }
}
