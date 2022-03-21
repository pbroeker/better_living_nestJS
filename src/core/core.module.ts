import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { TranslationModule } from './translation/translation.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, TranslationModule],
})
export class CoreModule {}
