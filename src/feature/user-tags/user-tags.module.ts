import { Module } from '@nestjs/common';
import { UserTagsController } from './user-tags.controller';
import { UserTagsService } from './user-tags.service';

@Module({
  controllers: [UserTagsController],
  providers: [UserTagsService],
})
export class UserTagsModule {}
