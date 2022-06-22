import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  InvitationTokenReqDto,
  InvitationTokenResDto,
  PendingInvitationResDto,
} from './dto/invitation-token.dto';
import { InvitationTokenService } from './invitation-token.service';
import { GuestUserResDto } from '../guest-user/dto/guest-user.dto';

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
    description: 'Returning pending invitations',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Pending invitations could not be loaded',
  })
  @Get('/pending')
  async getPendingInvitations(
    @User() user: CoreUserDto,
  ): Promise<PendingInvitationResDto[]> {
    return await this.invitationTokenService.getPendingInvitations(user);
  }

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

  @Post()
  async checkInvitationToken(
    @User() user: CoreUserDto,
    @Body() invitationReqDto: InvitationTokenReqDto,
  ): Promise<GuestUserResDto> {
    return await this.invitationTokenService.checkInvitationToken(
      user,
      invitationReqDto.invitationToken,
    );
  }
}
