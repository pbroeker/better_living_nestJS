import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { CoreUser } from './entity/user.entity';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([CoreUser]), SharedModule],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
