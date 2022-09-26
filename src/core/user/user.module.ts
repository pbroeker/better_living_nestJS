import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { CoreUser } from './entity/user.entity';
import { SharedModule } from '../../shared/shared.module';
import { UsersController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CoreUser]), SharedModule],
  providers: [UserService],
  exports: [UserService],
  controllers: [UsersController],
})
export class UserModule {}
