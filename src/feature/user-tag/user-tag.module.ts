import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from 'src/shared/shared.module';
import { UserTag } from './entity/userTags.entity';
import { UserTagsController } from './user-tag.controller';
import { UserTagService } from './user-tag.service';

@Module({
  controllers: [UserTagsController],
  imports: [SharedModule, TypeOrmModule.forFeature([UserTag])],
  providers: [UserTagService],
})
export class UserTagsModule {}
