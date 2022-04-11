import { Module } from '@nestjs/common';
import { PersonalAreaService } from './personal-area.service';
import { PersonalAreaController } from './personal-area.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalRoom } from '../personal-room/entity/personalRoom.entity';
import { CoreUser } from 'src/core/users/entity/user.entity';
import { PersonalArea } from './entity/personalArea.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([PersonalRoom, CoreUser, PersonalArea]),
  ],
  providers: [PersonalAreaService],
  controllers: [PersonalAreaController],
})
export class PersonalAreaModule {}
