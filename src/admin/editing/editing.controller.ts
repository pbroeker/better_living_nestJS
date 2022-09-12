import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminAccessDto } from './dto/password.dto';
import { AdminEditingService } from './editing.service';

@ApiBearerAuth()
@ApiTags('Admin-access')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('admin-access')
export class AdminEditingController {
  constructor(private adminEditingService: AdminEditingService) {}
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Edited user Tags',
    type: Boolean,
  })
  @Post('/edit-tags')
  async editUserTags(@Body() adminAccessDto: AdminAccessDto): Promise<boolean> {
    return await this.adminEditingService.addRoomsToTags(adminAccessDto);
  }
}
