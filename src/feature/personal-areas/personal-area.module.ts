import { Module } from '@nestjs/common';
import { PersonalAreaService } from './personal-area.service';
import { PersonalAreaController } from './personal-area.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalArea } from './entity/personalArea.entity';
import { SharedModule } from '../../shared/shared.module';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([PersonalArea])],
  providers: [PersonalAreaService],
  controllers: [PersonalAreaController],
})
export class PersonalAreaModule {}
