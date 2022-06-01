import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import { GuestUserDto } from './dto/guest-user.dto';
import { GuestUserService } from './guest-user.service';

@ApiBearerAuth()
@ApiTags('Guests')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('guest')
export class GuestUserController {
  constructor(private guestUserService: GuestUserService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning all user guests',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User guests could not be loaded',
  })
  @Get()
  async getGuests(@User() user: CoreUserDto): Promise<GuestUserDto[]> {
    return await this.guestUserService.getAllGuests(user);
  }
}
