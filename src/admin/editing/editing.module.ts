import { Module } from '@nestjs/common';
import { SharedModule } from '../../shared/shared.module';
import { AdminEditingController } from './editing.controller';
import { AdminEditingService } from './editing.service';

@Module({
  controllers: [AdminEditingController],
  imports: [SharedModule],
  providers: [AdminEditingService],
})
export class AdminEditingModule {}
