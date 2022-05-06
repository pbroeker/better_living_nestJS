import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { UserTag } from './entity/userTags.entity';
import { UserTagsController } from './user-tags.controller';
import { UserTagsService } from './user-tags.service';

@Module({
  controllers: [UserTagsController],
  imports: [SharedModule, TypeOrmModule.forFeature([UserTag])],
  providers: [UserTagsService],
})
export class UserTagsModule {}
