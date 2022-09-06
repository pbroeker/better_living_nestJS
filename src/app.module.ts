import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from './core/auth/guards/at.guard';
import { CoreModule } from './core/core.module';
import { FeatureModule } from './feature/feature.module';
import { SharedModule } from './shared/shared.module';
import { WellKnownMiddleware } from './utils/customMiddleware/wellknownMiddleware';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AdminEditingModule } from './admin/editing/editing.module';
@Module({
  imports: [
    CoreModule,
    FeatureModule,
    SharedModule,
    AdminEditingModule,
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, 'assets'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WellKnownMiddleware).forRoutes('*');
  }
}
