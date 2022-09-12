import { Module } from '@nestjs/common';
import { UserCommentService } from './user-comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCommentController } from './user-comment.controller';
import { SharedModule } from '../../shared/shared.module';
import { UserComment } from './entity/userComment.entity';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([UserComment])],
  controllers: [UserCommentController],
  providers: [UserCommentService],
})
export class UserCommentModule {}
