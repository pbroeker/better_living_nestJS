import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TranslationModule } from './translation/translation.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [AuthModule, DatabaseModule, UserModule, TranslationModule],
})
export class CoreModule {}
