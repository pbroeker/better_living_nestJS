import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { TranslationModule } from './translation/translation.module';
import { UsersModule } from './users/users.module';
import { AppLinkModule } from './app-links/app-links.module';
@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    TranslationModule,
    AppLinkModule,
  ],
})
export class CoreModule {}
