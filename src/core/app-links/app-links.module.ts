import { Module } from '@nestjs/common';
import { ApplinksController } from './app-links.controller';
import { ApplinksService } from './app-links.service';

@Module({
  controllers: [ApplinksController],
  providers: [ApplinksService],
})
export class AppLinkModule {}
