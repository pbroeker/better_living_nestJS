import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import { InvitationTokenResDto } from './dto/invitation-token.dto';
import { InvitationTokenService } from './invitation-token.service';

@ApiBearerAuth()
@ApiTags('invitation-token')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Wrong user credentials',
})
@Controller('invitation-token')
export class InvitationTokenController {
  constructor(private invitationTokenService: InvitationTokenService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returning invitation token',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Invitation token could not be loaded',
  })
  @Get()
  async createInvitationToken(
    @User() user: CoreUserDto,
  ): Promise<InvitationTokenResDto> {
    return await this.invitationTokenService.createInvitationToken(user);
  }
}
