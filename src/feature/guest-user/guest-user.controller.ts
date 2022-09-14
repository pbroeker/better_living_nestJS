import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/user/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  GuestUserGuestsResDto,
  GuestUserHostsResDto,
} from './dto/guest-user.dto';
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
    type: [GuestUserGuestsResDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User guests could not be loaded',
  })
  @Get()
  async getGuests(@User() user: CoreUserDto): Promise<GuestUserGuestsResDto[]> {
    return await this.guestUserService.getAllGuests(user);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning all user hosts',
    type: [GuestUserHostsResDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'User hosts could not be loaded',
  })
  @Get('/hosts')
  async getHosts(@User() user: CoreUserDto): Promise<GuestUserHostsResDto[]> {
    return await this.guestUserService.getAllHosts(user);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Host user successfully deleted',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Host user could not be deleted',
  })
  @Delete('/host/:hostId')
  async deleteHost(
    @User() user: CoreUserDto,
    @Param('hostId', ParseIntPipe) hostId: number,
  ): Promise<boolean> {
    return await this.guestUserService.deleteUser(hostId, user.userId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Guest removed',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Guest could not be removed',
  })
  @Delete('/:guestId')
  async deleteGuest(
    @User() user: CoreUserDto,
    @Param('guestId', ParseIntPipe) guestId: number,
  ): Promise<boolean> {
    return await this.guestUserService.deleteUser(user.userId, guestId);
  }
}
