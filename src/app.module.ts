import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [CoreModule, FeatureModule, SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
