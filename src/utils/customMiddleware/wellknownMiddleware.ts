import * as path from 'path';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class WellKnownMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('.well-known')) {
      const dirPath = path.resolve(__dirname, '../../assets/');
      let filename: string;
      if (req.originalUrl.includes('assetlinks.json')) {
        filename = 'assetlinks.json';
      } else if (req.originalUrl.includes('apple-app-site-association')) {
        filename = 'apple-app-site-association';
      } else {
        throw new HttpException(
          {
            title: 'app_link.error.title',
            text: 'app_link.error.message',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      res.sendFile(path.join(dirPath, filename));
    } else {
      next();
    }
  }
}
