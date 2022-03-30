import { Module, OnModuleInit } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TranslationController],
  providers: [TranslationService],
})
export class TranslationModule implements OnModuleInit {
  constructor(private translationService: TranslationService) {}
  async onModuleInit(): Promise<void> {
    //DOWNLOAD LATEST TRANSLATION JSONS ON INIT -> TODO: REMOVE ONCE AWS BUILD PIPELINE EXISTS
    await this.translationService.downloadTranslationFiles();
  }
}
