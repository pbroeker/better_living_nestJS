import * as path from 'path';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
// .wellknown doesn't work with globalPrefixExceptions (probably because of the .).
export class WellKnownMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('.well-known')) {
      const dirPath = path.resolve(__dirname, '../../assets/');
      let filename: string;
      if (req.originalUrl.includes('assetlinks.json')) {
        filename = 'assetlinks.json';
        res.sendFile(path.join(dirPath, filename));
      } else if (req.originalUrl.includes('apple-app-site-association')) {
        filename = 'apple-app-site-association';
        res.sendFile(path.join(dirPath, filename));
      } else {
        res.status(200).send();
      }
    } else {
      next();
    }
  }
}
