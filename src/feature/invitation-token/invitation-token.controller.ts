import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CoreUserDto } from '../../core/users/dto/core-user.dto';
import { User } from '../../utils/customDecorators/user.decorator';
import {
  InvitationTokenReqDto,
  InvitationTokenResDto,
  PendingInvitationResDto,
} from './dto/invitation-token.dto';
import { InvitationTokenService } from './invitation-token.service';
import { GuestUserFullResDto } from '../guest-user/dto/guest-user.dto';

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
    type: [PendingInvitationResDto],
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
    type: InvitationTokenResDto,
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

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully added as guest',
    type: GuestUserFullResDto,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Adding as guest failed',
  })
  @Post()
  async checkInvitationToken(
    @User() user: CoreUserDto,
    @Body() invitationReqDto: InvitationTokenReqDto,
  ): Promise<GuestUserFullResDto> {
    return await this.invitationTokenService.checkInvitationToken(
      user,
      invitationReqDto.invitationToken,
    );
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitationtoken deleted',
    type: Boolean,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Invitationtoken could not be deleted',
  })
  @Delete('/:tokenId')
  async deleteInvitationToken(
    @User() user: CoreUserDto,
    @Param('tokenId', ParseIntPipe) tokenId: number,
  ): Promise<boolean> {
    return await this.invitationTokenService.deleteInvitationToken(
      user,
      tokenId,
    );
  }
}
