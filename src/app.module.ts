import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';
import { ConfigModule } from '@nestjs/config';
// import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule.forRoot(), CoreModule, FeatureModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
