import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { DatabaseModule } from './core/database/database.module';
import { FeatureModule } from './feature/feature.module';

@Module({
  imports: [DatabaseModule, CoreModule, FeatureModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
