import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TranslationController],
  providers: [TranslationService],
})
export class TranslationModule {}
