import { Module } from '@nestjs/common';
import { SharedModule } from 'src/shared/shared.module';
import { UserImageController } from './user-image.controller';

@Module({
  imports: [SharedModule],
  controllers: [UserImageController],
  providers: [],
})
export class UserImageModule {}
