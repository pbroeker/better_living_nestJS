import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';
import { ConfigModule } from '@nestjs/config';
import nestconfig from 'src/config/nest.config';
import databaseconfig from 'src/config/database.config';
// import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [nestconfig, databaseconfig],
    }),
    CoreModule,
    FeatureModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
